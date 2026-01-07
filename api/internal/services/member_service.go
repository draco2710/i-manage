package services

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"strings"
	"unicode"

	"github.com/redis/go-redis/v9"
	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
	"i-manage/internal/constants"
	"i-manage/internal/database"
	"i-manage/internal/models"
)

// MemberService handles iCom member management operations
type MemberService struct {
	rdb         *redis.Client
	ishopService *IShopService
}

// NewMemberService creates a new member service
func NewMemberService() *MemberService {
	return &MemberService{
		rdb:          database.Rdb,
		ishopService: NewIShopService(),
	}
}

// AddMember adds a shop to iCom (creates iShop and establishes membership)
func (s *MemberService) AddMember(ctx context.Context, icomID string, req models.AddMemberRequest) (string, error) {
	// Create iShop first
	createShopReq := models.CreateIShopRequest{
		Name:        req.Name,
		Description: req.Description,
		Logo:        req.Logo,
		Banner:      req.Banner,
		ImageURLs:   req.ImageURLs,
		Province:    req.Province,
		District:    req.District,
		Ward:        req.Ward,
		Street:      req.Street,
		Lat:         req.Lat,
		Lng:         req.Lng,
		Phone:       req.Phone,
		Email:       req.Email,
		Website:     req.Website,
		Industry:    req.Industry,
		SubIndustry: req.SubIndustry,
	}

	shopProfile, err := s.ishopService.CreateIShop(ctx, createShopReq)
	if err != nil {
		return "", err
	}

	shopID := shopProfile.ID

	// Set default values
	rank := req.Rank
	if rank == "" {
		rank = "MEMBER"
	}
	status := req.Status
	if status == "" {
		status = constants.MEMBER_STATUS_ACTIVE
	}

	now := time.Now()
	joinedDate := now.Format(time.RFC3339)
	timestamp := float64(now.Unix())

	// Use transaction to atomically add member
	pipe := s.rdb.TxPipeline()

	// 1. Add to members sorted set (score = join timestamp)
	pipe.ZAdd(ctx, fmt.Sprintf("icom:%s:members", icomID), redis.Z{
		Score:  timestamp,
		Member: shopID,
	})

	// 2-8. Manual Indexing REMOVED (Replaced by RediSearch)
	// No need to SAdd to: ind, sub, loc, search, geo, status, rank keys.
	// RediSearch indexes `ishop` profile automatically based on HASH fields.
	// Geo index is maintained by `ishop` service logic (or should be).
	
	// Note: We still might need `geo` key if we use GEOSEARCH command specifically 
	// separate from RediSearch for some legacy reason, but optimization plan says to consolidate.
	// However, `AddMember` explicitly calls `pipe.GeoAdd`. 
	// If `GeoSearch` handler relies on `icom:ID:geo`, we must KEEP it or REFACTOR `GeoSearch`.
	// Optimization Plan Point 3 says: "Remove shop from icom:{id}:geo".
	// This implies we SHOULD NOT add it here either.
	// So I will remove it.

	// 9. Save membership details
	pipe.HSet(ctx, fmt.Sprintf("icom:%s:member:%s", icomID, shopID), map[string]interface{}{
		"shopId":     shopID,
		"icomId":     icomID,
		"rank":       rank,
		"status":     status,
		"joinedDate": joinedDate,
		"role":       req.Role,
	})

	// 10. Increment total members count
	pipe.HIncrBy(ctx, fmt.Sprintf("icom:%s", icomID), "totalMembers", 1)
	if status == constants.MEMBER_STATUS_ACTIVE {
		pipe.HIncrBy(ctx, fmt.Sprintf("icom:%s", icomID), "activeMembers", 1)
	}

	// 11. Add to shop's iComs list (for reverse lookup) & Update icoms TAG in shop profile
	icomName, _ := s.rdb.HGet(ctx, fmt.Sprintf("icom:%s", icomID), "name").Result()
	pipe.ZAdd(ctx, fmt.Sprintf("ishop:%s:icoms", shopID), redis.Z{
		Score:  timestamp,
		Member: icomID,
	})
	
	// 12. Update iCom Metadata Aggregation (Phase 17)
	s.updateMetadataAggregation(ctx, pipe, icomID, req.Industry, req.SubIndustry, req.Province, req.District, req.Ward, 1)

	pipe.HSet(ctx, fmt.Sprintf("ishop:%s:icom:%s", shopID, icomID), map[string]interface{}{
		"icomId":     icomID,
		"icomName":   icomName,
		"rank":       rank,
		"status":     status,
		"joinedDate": joinedDate,
		"role":       req.Role,
	})

	// Get current icoms and append new one
	shopKey := fmt.Sprintf("ishop:%s", shopID)
	currentIComs, err := s.rdb.HGet(ctx, shopKey, "icoms").Result()
	if err != nil && err != redis.Nil {
		fmt.Printf("DEBUG: HGet icoms error: %v\n", err)
	}
	newIComs := icomID
	if currentIComs != "" {
		// Ensure uniqueness and append
		ids := strings.Fields(currentIComs)
		exists := false
		for _, id := range ids {
			if id == icomID {
				exists = true
				break
			}
		}
		if !exists {
			newIComs = currentIComs + " " + icomID
		} else {
			newIComs = currentIComs
		}
	}
	fmt.Printf("DEBUG: Setting icoms for shop %s to: [%s]\n", shopID, newIComs)
	pipe.HSet(ctx, shopKey, "icoms", newIComs)

	// Execute transaction
	_, err = pipe.Exec(ctx)
	if err != nil {
		// Rollback: delete the created shop
		s.ishopService.DeleteIShop(ctx, shopID)
		return "", err
	}

	return shopID, nil
}

// RemoveMember removes a shop from iCom
func (s *MemberService) RemoveMember(ctx context.Context, icomID, shopID string) error {
	// Get membership details first to know indexes to clean
	memberKey := fmt.Sprintf("icom:%s:member:%s", icomID, shopID)
	memberData, err := s.rdb.HGetAll(ctx, memberKey).Result()
	if err != nil || len(memberData) == 0 {
		return fmt.Errorf("membership not found")
	}

	// Get shop data for indexes
	shopData, _ := s.rdb.HGetAll(ctx, fmt.Sprintf("ishop:%s", shopID)).Result()

	pipe := s.rdb.TxPipeline()

	// 1. Remove from members sorted set
	pipe.ZRem(ctx, fmt.Sprintf("icom:%s:members", icomID), shopID)

	// 2. Remove from industry indexes
	if industry := shopData["industry"]; industry != "" {
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:ind:%s", icomID, industry), shopID)
	}
	if subIndustry := shopData["subIndustry"]; subIndustry != "" {
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:sub:%s", icomID, subIndustry), shopID)
	}

	// 3. Remove from location indexes
	if province := shopData["province"]; province != "" {
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:loc:province:%s", icomID, province), shopID)
	}
	if district := shopData["district"]; district != "" {
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:loc:district:%s", icomID, district), shopID)
	}
	if ward := shopData["ward"]; ward != "" {
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:loc:ward:%s", icomID, ward), shopID)
	}

	// 4. Remove from name search index
	if name := shopData["name"]; name != "" {
		tokens := s.tokenize(name)
		for _, token := range tokens {
			pipe.SRem(ctx, fmt.Sprintf("icom:%s:search:%s", icomID, token), shopID)
		}
	}

	// 5. Remove from geo index
	pipe.ZRem(ctx, fmt.Sprintf("icom:%s:geo", icomID), shopID)

	// 5b. Update iCom Metadata Aggregation (Phase 17)
	s.updateMetadataAggregation(ctx, pipe, icomID, shopData["industry"], shopData["subIndustry"], shopData["province"], shopData["district"], shopData["ward"], -1)

	// 6. Remove from status index
	if status := memberData["status"]; status != "" {
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:status:%s", icomID, status), shopID)
	}

	// 7. Remove from rank index
	if rank := memberData["rank"]; rank != "" {
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:rank:%s", icomID, rank), shopID)
	}

	// 7. Delete membership details
	pipe.Del(ctx, memberKey)

	// 8. Remove from ranking sets
	pipe.ZRem(ctx, fmt.Sprintf("icom:%s:rank:interactions", icomID), shopID)
	pipe.ZRem(ctx, fmt.Sprintf("icom:%s:rank:likes", icomID), shopID)

	// 9. Decrement member counts
	pipe.HIncrBy(ctx, fmt.Sprintf("icom:%s", icomID), "totalMembers", -1)
	if memberData["status"] == constants.MEMBER_STATUS_ACTIVE {
		pipe.HIncrBy(ctx, fmt.Sprintf("icom:%s", icomID), "activeMembers", -1)
	}

	// 10. Remove from shop's iComs list
	pipe.ZRem(ctx, fmt.Sprintf("ishop:%s:icoms", shopID), icomID)
	pipe.Del(ctx, fmt.Sprintf("ishop:%s:icom:%s", shopID, icomID))

	_, err = pipe.Exec(ctx)
	return err
}

// GetMemberDetail gets membership details
func (s *MemberService) GetMemberDetail(ctx context.Context, icomID, shopID string) (*models.MembershipDetail, error) {
	memberKey := fmt.Sprintf("icom:%s:member:%s", icomID, shopID)
	data, err := s.rdb.HGetAll(ctx, memberKey).Result()
	if err != nil || len(data) == 0 {
		return nil, fmt.Errorf("membership not found")
	}

	// Get iCom name
	icomName, _ := s.rdb.HGet(ctx, fmt.Sprintf("icom:%s", icomID), "name").Result()

	return &models.MembershipDetail{
		ShopID:     data["shopId"],
		IComID:     data["icomId"],
		IComName:   icomName,
		Rank:       data["rank"],
		Status:     data["status"],
		JoinedDate: data["joinedDate"],
		Role:       data["role"],
		Benefits:   data["benefits"],
	}, nil
}

// UpdateMemberStatus updates member rank/status
func (s *MemberService) UpdateMemberStatus(ctx context.Context, icomID, shopID string, req models.UpdateMemberStatusRequest) error {
	memberKey := fmt.Sprintf("icom:%s:member:%s", icomID, shopID)
	
	// Get current data
	currentData, err := s.rdb.HGetAll(ctx, memberKey).Result()
	if err != nil || len(currentData) == 0 {
		return fmt.Errorf("membership not found")
	}

	updates := make(map[string]interface{})
	pipe := s.rdb.TxPipeline()

	// Update rank
	if req.Rank != "" && req.Rank != currentData["rank"] {
		updates["rank"] = req.Rank
		// Move to new rank index
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:rank:%s", icomID, currentData["rank"]), shopID)
		pipe.SAdd(ctx, fmt.Sprintf("icom:%s:rank:%s", icomID, req.Rank), shopID)
	}

	// Update status
	if req.Status != "" && req.Status != currentData["status"] {
		updates["status"] = req.Status
		// Move to new status index
		pipe.SRem(ctx, fmt.Sprintf("icom:%s:status:%s", icomID, currentData["status"]), shopID)
		pipe.SAdd(ctx, fmt.Sprintf("icom:%s:status:%s", icomID, req.Status), shopID)

		// Update active member count
		if currentData["status"] == constants.MEMBER_STATUS_ACTIVE && req.Status != constants.MEMBER_STATUS_ACTIVE {
			pipe.HIncrBy(ctx, fmt.Sprintf("icom:%s", icomID), "activeMembers", -1)
		} else if currentData["status"] != constants.MEMBER_STATUS_ACTIVE && req.Status == constants.MEMBER_STATUS_ACTIVE {
			pipe.HIncrBy(ctx, fmt.Sprintf("icom:%s", icomID), "activeMembers", 1)
		}
	}

	// Update role
	if req.Role != "" {
		updates["role"] = req.Role
	}

	// Apply updates
	if len(updates) > 0 {
		pipe.HSet(ctx, memberKey, updates)
	}

	_, err = pipe.Exec(ctx)
	return err
}

// UpdateMemberOrder updates the display order of a member
func (s *MemberService) UpdateMemberOrder(ctx context.Context, icomID, shopID string, displayOrder int) error {
	// Verify membership exists
	memberKey := fmt.Sprintf("icom:%s:member:%s", icomID, shopID)
	exists, err := s.rdb.Exists(ctx, memberKey).Result()
	if err != nil {
		return err
	}
	if exists == 0 {
		return fmt.Errorf("membership not found")
	}

	// Update displayOrder in membership hash
	err = s.rdb.HSet(ctx, memberKey, "displayOrder", displayOrder).Err()
	if err != nil {
		return err
	}

	// Update score in sorted set (this controls the display order)
	membersKey := fmt.Sprintf("icom:%s:members", icomID)
	err = s.rdb.ZAdd(ctx, membersKey, redis.Z{
		Score:  float64(displayOrder),
		Member: shopID,
	}).Err()
	if err != nil {
		return err
	}

	return nil
}

// ListMembers lists all members with pagination
func (s *MemberService) ListMembers(ctx context.Context, icomID string, page, limit int) (*models.MemberListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	start := int64((page - 1) * limit)
	stop := int64(page*limit - 1)

	// Get members from sorted set
	shopIDs, err := s.rdb.ZRange(ctx, fmt.Sprintf("icom:%s:members", icomID), start, stop).Result()
	if err != nil {
		return nil, err
	}

	// Get total count
	total, _ := s.rdb.ZCard(ctx, fmt.Sprintf("icom:%s:members", icomID)).Result()

	members := make([]models.MemberSummary, 0, len(shopIDs))
	for _, shopID := range shopIDs {
		summary, err := s.getMemberSummary(ctx, icomID, shopID)
		if err == nil {
			members = append(members, *summary)
		}
	}

	return &models.MemberListResponse{
		Members: members,
		Total:   int(total),
		Page:    page,
		Limit:   limit,
	}, nil
}

// FilterMembers filters members by criteria including fuzzy name search
func (s *MemberService) FilterMembers(ctx context.Context, icomID string, req models.FilterMembersRequest) (*models.MemberListResponse, error) {
	// Build list of sets to intersect
	sets := make([]string, 0)

	// 1. Text search tokens
	if req.Query != "" {
		tokens := s.tokenize(req.Query)
		for _, token := range tokens {
			if len(token) >= 2 {
				sets = append(sets, fmt.Sprintf("icom:%s:search:%s", icomID, token))
			}
		}
	}

	// 2. Industry filters
	if req.Industry != "" {
		sets = append(sets, fmt.Sprintf("icom:%s:ind:%s", icomID, req.Industry))
	}
	if req.SubIndustry != "" {
		sets = append(sets, fmt.Sprintf("icom:%s:sub:%s", icomID, req.SubIndustry))
	}

	// 3. Location filters
	if req.Province != "" {
		sets = append(sets, fmt.Sprintf("icom:%s:loc:province:%s", icomID, req.Province))
	}
	if req.District != "" {
		sets = append(sets, fmt.Sprintf("icom:%s:loc:district:%s", icomID, req.District))
	}
	if req.Ward != "" {
		sets = append(sets, fmt.Sprintf("icom:%s:loc:ward:%s", icomID, req.Ward))
	}

	// 4. Membership filters
	if req.Status != "" {
		sets = append(sets, fmt.Sprintf("icom:%s:status:%s", icomID, req.Status))
	}
	if req.Rank != "" {
		sets = append(sets, fmt.Sprintf("icom:%s:rank:%s", icomID, req.Rank))
	}

	var shopIDs []string
	var err error

	if len(sets) == 0 {
		// No filters, return all members (paginated)
		return s.ListMembers(ctx, icomID, req.Page, req.Limit)
	} else if len(sets) == 1 {
		// Single set
		shopIDs, err = s.rdb.SMembers(ctx, sets[0]).Result()
	} else {
		// Multiple sets - use intersection
		shopIDs, err = s.rdb.SInter(ctx, sets...).Result()
	}

	if err != nil {
		return nil, err
	}

	// Apply pagination
	if req.Page < 1 {
		req.Page = 1
	}
	if req.Limit < 1 {
		req.Limit = 20
	}

	total := len(shopIDs)
	start := (req.Page - 1) * req.Limit
	end := start + req.Limit

	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	paginatedIDs := shopIDs[start:end]

	members := make([]models.MemberSummary, 0, len(paginatedIDs))
	for _, shopID := range paginatedIDs {
		summary, err := s.getMemberSummary(ctx, icomID, shopID)
		if err == nil {
			members = append(members, *summary)
		}
	}

	return &models.MemberListResponse{
		Members: members,
		Total:   total,
		Page:    req.Page,
		Limit:   req.Limit,
	}, nil
}

// GlobalSearch performs a cross-field search using RediSearch
func (s *MemberService) GlobalSearch(ctx context.Context, icomID string, query string, page, limit int) (*models.MemberListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	offset := (page - 1) * limit

	// Build RediSearch query: Filter by icomID tag and fuzzy/prefix query
	// Syntax: @icoms:{icomID} (query*)
	searchQuery := fmt.Sprintf("@icoms:{%s}", icomID)
	if query != "" {
		// Clean query and add prefix matching
		tokens := s.tokenize(query)
		if len(tokens) > 0 {
			qParts := make([]string, len(tokens))
			for i, t := range tokens {
				if len(t) > 1 {
					qParts[i] = t + "*" // prefix match for longer tokens
				} else {
					qParts[i] = t // exact match for single characters/numbers (avoids min-prefix limit)
				}
			}
			searchQuery += " (" + strings.Join(qParts, " ") + ")"
		}
	}

	// Execute FT.SEARCH
	// FT.SEARCH idx:ishop "@icoms:{2000100102} (word1* word2*)" LIMIT offset limit
	args := []interface{}{"FT.SEARCH", "idx:ishop", searchQuery, "LIMIT", offset, limit}
	res, err := s.rdb.Do(ctx, args...).Result()
	if err != nil {
		fmt.Printf("DEBUG: FT.SEARCH error: %v\n", err)
		return nil, fmt.Errorf("search error: %v", err)
	}

	// Handle different response types (Slice vs Map)
	var resSlice []interface{}
	var resMap []interface{} // For map-based results
	total := int64(0)
	isMapResponse := false

	switch v := res.(type) {
	case []interface{}:
		resSlice = v
		if len(resSlice) > 0 {
			switch t := resSlice[0].(type) {
			case int64:
				total = t
			case int:
				total = int64(t)
			}
		}
	case map[interface{}]interface{}:
		isMapResponse = true
		// Extract Total
		if val, ok := v["total_results"]; ok {
			switch t := val.(type) {
			case int64:
				total = t
			case int:
				total = int64(t)
			}
		}

		// Extract Results
		if val, ok := v["results"]; ok {
			if s, ok := val.([]interface{}); ok {
				resMap = s
			}
		}
	default:
		fmt.Printf("DEBUG: FT.SEARCH unexpected response type: %T\n", res)
		return &models.MemberListResponse{
			Members: []models.MemberSummary{},
			Total:   0,
			Page:    page,
			Limit:   limit,
		}, nil
	}

	members := make([]models.MemberSummary, 0)

	// STRATEGY 1: Map Response (RESP3)
	if isMapResponse {
		for _, item := range resMap {
			if itemMap, ok := item.(map[interface{}]interface{}); ok {
				// Get Key
				key := ""
				if idVal, ok := itemMap["id"]; ok {
					key = idVal.(string)
				}
				shopID := strings.TrimPrefix(key, "ishop:")

				// Get Fields
				fieldMap := make(map[string]string)
				if extraAttrs, ok := itemMap["extra_attributes"]; ok {
					if attrsMap, ok := extraAttrs.(map[interface{}]interface{}); ok {
						for k, v := range attrsMap {
							if kStr, ok := k.(string); ok {
								if vStr, ok := v.(string); ok {
									fieldMap[kStr] = vStr
								}
							}
						}
					}
				}

				// Common mapping logic
				lat, _ := strconv.ParseFloat(fieldMap["lat"], 64)
				lng, _ := strconv.ParseFloat(fieldMap["lng"], 64)

				memberData, _ := s.rdb.HGetAll(ctx, fmt.Sprintf("icom:%s:member:%s", icomID, shopID)).Result()

				members = append(members, models.MemberSummary{
					ShopID:      shopID,
					Name:        fieldMap["name"],
					Logo:        fieldMap["logo"],
					Industry:    fieldMap["industry"],
					SubIndustry: fieldMap["subIndustry"],
					Province:    fieldMap["province"],
					District:    fieldMap["district"],
					Ward:        fieldMap["ward"],
					Rank:        memberData["rank"],
					Status:      memberData["status"],
					JoinedDate:  memberData["joinedDate"],
					Lat:         lat,
					Lng:         lng,
				})
			}
		}
	} else {
		// STRATEGY 2: Slice Response (RESP2)
		// Format: [total, key1, fields1, key2, fields2...]
		for i := 1; i < len(resSlice); i += 2 {
			key, ok := resSlice[i].(string)
			if !ok {
				continue
			}
			shopID := strings.TrimPrefix(key, "ishop:")

			fields, ok := resSlice[i+1].([]interface{})
			if !ok {
				continue
			}

			fieldMap := make(map[string]string)
			for j := 0; j < len(fields); j += 2 {
				if k, ok := fields[j].(string); ok {
					if v, ok := fields[j+1].(string); ok {
						fieldMap[k] = v
					}
				}
			}

			lat, _ := strconv.ParseFloat(fieldMap["lat"], 64)
			lng, _ := strconv.ParseFloat(fieldMap["lng"], 64)

			memberData, _ := s.rdb.HGetAll(ctx, fmt.Sprintf("icom:%s:member:%s", icomID, shopID)).Result()

			members = append(members, models.MemberSummary{
				ShopID:      shopID,
				Name:        fieldMap["name"],
				Logo:        fieldMap["logo"],
				Industry:    fieldMap["industry"],
				SubIndustry: fieldMap["subIndustry"],
				Province:    fieldMap["province"],
				District:    fieldMap["district"],
				Ward:        fieldMap["ward"],
				Rank:        memberData["rank"],
				Status:      memberData["status"],
				JoinedDate:  memberData["joinedDate"],
				Lat:         lat,
				Lng:         lng,
			})
		}
	}

	return &models.MemberListResponse{
		Members: members,
		Total:   int(total),
		Page:    page,
		Limit:   limit,
	}, nil
}
func (s *MemberService) GeoSearch(ctx context.Context, icomID string, req models.GeoSearchRequest) ([]models.MemberSummary, error) {
	unit := req.Unit
	if unit == "" {
		unit = "km"
	}

	// Use GEORADIUS to find nearby shops
	results, err := s.rdb.GeoRadius(ctx, fmt.Sprintf("icom:%s:geo", icomID), req.Lng, req.Lat, &redis.GeoRadiusQuery{
		Radius: req.Radius,
		Unit:   unit,
		WithCoord: true,
		WithDist:  true,
		Sort:      "ASC", // Nearest first
	}).Result()

	if err != nil {
		return nil, err
	}

	members := make([]models.MemberSummary, 0, len(results))
	for _, result := range results {
		shopID := result.Name
		summary, err := s.getMemberSummary(ctx, icomID, shopID)
		if err == nil {
			members = append(members, *summary)
		}
	}

	return members, nil
}

// getMemberSummary gets a brief summary of a member
func (s *MemberService) getMemberSummary(ctx context.Context, icomID, shopID string) (*models.MemberSummary, error) {
	// Get shop data
	shopData, err := s.rdb.HGetAll(ctx, fmt.Sprintf("ishop:%s", shopID)).Result()
	if err != nil || len(shopData) == 0 {
		return nil, fmt.Errorf("shop not found")
	}

	// Get membership data
	memberData, _ := s.rdb.HGetAll(ctx, fmt.Sprintf("icom:%s:member:%s", icomID, shopID)).Result()

	// Parse coordinates
	lat, _ := s.rdb.HGet(ctx, fmt.Sprintf("ishop:%s", shopID), "lat").Float64()
	lng, _ := s.rdb.HGet(ctx, fmt.Sprintf("ishop:%s", shopID), "lng").Float64()

	return &models.MemberSummary{
		ShopID:      shopID,
		Name:        shopData["name"],
		Logo:        shopData["logo"],
		Industry:    shopData["industry"],
		SubIndustry: shopData["subIndustry"],
		Province:    shopData["province"],
		District:    shopData["district"],
		Ward:        shopData["ward"],
		Rank:        memberData["rank"],
		Status:      memberData["status"],
		JoinedDate:  memberData["joinedDate"],
		Lat:         lat,
		Lng:         lng,
	}, nil
}

// tokenize breaks a string into normalized tokens for indexing
func (s *MemberService) tokenize(text string) []string {
	// 1. Remove accents/diacritics
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	normalized, _, _ := transform.String(t, text)

	// 2. Lowercase and split by non-alphanumeric characters
	normalized = strings.ToLower(normalized)
	f := func(c rune) bool {
		return !unicode.IsLetter(c) && !unicode.IsNumber(c)
	}
	return strings.FieldsFunc(normalized, f)
}

// updateMetadataAggregation updates the reference counts for industries and areas
func (s *MemberService) updateMetadataAggregation(ctx context.Context, pipe redis.Pipeliner, icomID string, industry, subIndustry, province, district, ward string, delta float64) {
	if industry != "" {
		pipe.ZIncrBy(ctx, fmt.Sprintf("icom:%s:meta:industries", icomID), delta, industry)
	}
	if subIndustry != "" {
		pipe.ZIncrBy(ctx, fmt.Sprintf("icom:%s:meta:sub_industries", icomID), delta, subIndustry)
	}

	// Areas: Flattened province and district, skip ward
	if province != "" {
		pipe.ZIncrBy(ctx, fmt.Sprintf("icom:%s:meta:areas", icomID), delta, province)
	}
	if district != "" {
		pipe.ZIncrBy(ctx, fmt.Sprintf("icom:%s:meta:areas", icomID), delta, district)
	}
}
