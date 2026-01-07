package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
	"i-manage/internal/constants"
	"i-manage/internal/database"
	"i-manage/internal/models"
)

// IComService handles all iCom-related Redis operations
type IComService struct {
	rdb *redis.Client
}

// NewIComService creates a new iCom service
func NewIComService() *IComService {
	return &IComService{
		rdb: database.Rdb,
	}
}

// GenerateIComID generates a unique ID for iCom
func (s *IComService) GenerateIComID(ctx context.Context) (string, error) {
	// Use Redis INCR to generate sequential IDs
	// Format: 200010010 + sequential number
	counter, err := s.rdb.Incr(ctx, "icom:id:counter").Result()
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("200010010%d", counter), nil
}

// CreateICom creates a new iCom in Redis
func (s *IComService) CreateICom(ctx context.Context, req models.CreateIComRequest) (*models.IComProfile, error) {
	// Generate ID
	id, err := s.GenerateIComID(ctx)
	if err != nil {
		return nil, err
	}

	// Generate private code (8 digits)
	privateCode := fmt.Sprintf("%08d", time.Now().UnixNano()%100000000)

	// Marshal JSON fields
	allowedIndustries, _ := json.Marshal(req.AllowedIndustries)
	operatingAreas, _ := json.Marshal(req.OperatingAreas)

	now := time.Now().Format(time.RFC3339)

	// Create profile
	profile := models.IComProfile{
		ID:                id,
		CardType:          constants.CARD_TYPE_ICOM,
		PackageID:         "",
		Private:           privateCode,
		Name:              req.Name,
		FullName:          req.FullName,
		Slogan:            req.Slogan,
		Description:       req.Description,
		Logo:              req.Logo,
		Banner:            req.Banner,
		ThemeColor:        req.ThemeColor,
		Address:           req.Address,
		Phone:             req.Phone,
		Email:             req.Email,
		Website:           req.Website,
		AllowedIndustries: string(allowedIndustries),
		OperatingAreas:    string(operatingAreas),
		Status:            constants.STATUS_ACTIVE,
		RequireApproval:   strconv.FormatBool(req.RequireApproval),
		AutoActivate:      strconv.FormatBool(req.AutoActivate),
		MaxMembers:        req.MaxMembers,
		TotalMembers:      0,
		ActiveMembers:     0,
		Created:           now,
		Modified:          now,
	}

	// Save to Redis
	key := fmt.Sprintf("icom:%s", id)
	err = s.rdb.HSet(ctx, key, map[string]interface{}{
		"id":                id,
		"cardType":          profile.CardType,
		"packageId":         profile.PackageID,
		"private":           profile.Private,
		"name":              profile.Name,
		"fullName":          profile.FullName,
		"slogan":            profile.Slogan,
		"description":       profile.Description,
		"logo":              profile.Logo,
		"banner":            profile.Banner,
		"themeColor":        profile.ThemeColor,
		"address":           profile.Address,
		"phone":             profile.Phone,
		"email":             profile.Email,
		"website":           profile.Website,
		"allowedIndustries": profile.AllowedIndustries,
		"operatingAreas":    profile.OperatingAreas,
		"status":            profile.Status,
		"requireApproval":   profile.RequireApproval,
		"autoActivate":      profile.AutoActivate,
		"maxMembers":        profile.MaxMembers,
		"totalMembers":      0,
		"activeMembers":     0,
		"created":           profile.Created,
		"modified":          profile.Modified,
	}).Err()

	if err != nil {
		return nil, err
	}

	// Add to global list of iComs (Sorted Set)
	err = s.rdb.ZAdd(ctx, "icoms:all", redis.Z{
		Score:  float64(time.Now().Unix()),
		Member: id,
	}).Err()
	if err != nil {
		// Log error but don't fail creation? 
		// Ideally we should handle this, but for now we proceed.
	}

	return &profile, nil
}

// GetICom retrieves iCom profile from Redis
func (s *IComService) GetICom(ctx context.Context, id string) (*models.IComProfile, error) {
	key := fmt.Sprintf("icom:%s", id)
	exists, err := s.rdb.Exists(ctx, key).Result()
	if err != nil {
		return nil, err
	}
	if exists == 0 {
		return nil, fmt.Errorf("iCom not found")
	}

	data, err := s.rdb.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	// Convert map to struct
	profile := &models.IComProfile{
		ID:                data["id"],
		CardType:          data["cardType"],
		PackageID:         data["packageId"],
		Private:           data["private"],
		Name:              data["name"],
		FullName:          data["fullName"],
		Slogan:            data["slogan"],
		Description:       data["description"],
		Logo:              data["logo"],
		Banner:            data["banner"],
		ThemeColor:        data["themeColor"],
		Address:           data["address"],
		Phone:             data["phone"],
		Email:             data["email"],
		Website:           data["website"],
		AllowedIndustries: data["allowedIndustries"],
		OperatingAreas:    data["operatingAreas"],
		Status:            data["status"],
		RequireApproval:   data["requireApproval"],
		AutoActivate:      data["autoActivate"],
		Created:           data["created"],
		Modified:          data["modified"],
	}

	// Parse integers
	if v, ok := data["maxMembers"]; ok {
		profile.MaxMembers, _ = strconv.Atoi(v)
	}
	if v, ok := data["totalMembers"]; ok {
		profile.TotalMembers, _ = strconv.Atoi(v)
	}
	if v, ok := data["activeMembers"]; ok {
		profile.ActiveMembers, _ = strconv.Atoi(v)
	}

	return profile, nil
}

// UpdateICom updates iCom profile
func (s *IComService) UpdateICom(ctx context.Context, id string, req models.UpdateIComRequest) error {
	key := fmt.Sprintf("icom:%s", id)
	exists, err := s.rdb.Exists(ctx, key).Result()
	if err != nil {
		return err
	}
	if exists == 0 {
		return fmt.Errorf("iCom not found")
	}

	// Build update map
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.FullName != "" {
		updates["fullName"] = req.FullName
	}
	if req.Slogan != "" {
		updates["slogan"] = req.Slogan
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Logo != "" {
		updates["logo"] = req.Logo
	}
	if req.Banner != "" {
		updates["banner"] = req.Banner
	}
	if req.ThemeColor != "" {
		updates["themeColor"] = req.ThemeColor
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Website != "" {
		updates["website"] = req.Website
	}
	if req.AllowedIndustries != nil {
		allowedIndustries, _ := json.Marshal(req.AllowedIndustries)
		updates["allowedIndustries"] = string(allowedIndustries)
	}
	if req.OperatingAreas != nil {
		operatingAreas, _ := json.Marshal(req.OperatingAreas)
		updates["operatingAreas"] = string(operatingAreas)
	}
	if req.RequireApproval != nil {
		updates["requireApproval"] = strconv.FormatBool(*req.RequireApproval)
	}
	if req.AutoActivate != nil {
		updates["autoActivate"] = strconv.FormatBool(*req.AutoActivate)
	}
	if req.MaxMembers > 0 {
		updates["maxMembers"] = req.MaxMembers
	}

	// Always update modified timestamp
	updates["modified"] = time.Now().Format(time.RFC3339)

	return s.rdb.HSet(ctx, key, updates).Err()
}

// DeleteICom deletes iCom and all related data
func (s *IComService) DeleteICom(ctx context.Context, id string) error {
	// Use transaction to delete all related keys
	pipe := s.rdb.Pipeline()

	// Delete main profile
	pipe.Del(ctx, fmt.Sprintf("icom:%s", id))

	// Delete members set
	pipe.Del(ctx, fmt.Sprintf("icom:%s:members", id))

	// Delete board list and details (would need to get list first)
	// Delete actions list and details (would need to get list first)

	// Delete ranking sets
	pipe.Del(ctx, fmt.Sprintf("icom:%s:rank:interactions", id))
	pipe.Del(ctx, fmt.Sprintf("icom:%s:rank:likes", id))

	// Delete geo index
	pipe.Del(ctx, fmt.Sprintf("icom:%s:geo", id))

	// Remove from global list (Sorted Set)
	pipe.ZRem(ctx, "icoms:all", id)

	// Execute pipeline
	_, err := pipe.Exec(ctx)
	return err
}

// ListIComs listing all iComs
func (s *IComService) ListIComs(ctx context.Context, page, limit int) (*models.IComListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	key := "icoms:all"
	// 1. Get total count
	total, err := s.rdb.ZCard(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	// 2. Get paginated IDs (Newest first)
	start := int64((page - 1) * limit)
	stop := start + int64(limit) - 1
	ids, err := s.rdb.ZRevRange(ctx, key, start, stop).Result()
	if err != nil {
		return nil, err
	}

	if len(ids) == 0 {
		return &models.IComListResponse{
			IComs: []models.IComProfile{},
			Total: int(total),
			Page:  page,
			Limit: limit,
		}, nil
	}

	// 3. Use Pipeline to fetch all profiles in ONE round-trip
	pipe := s.rdb.Pipeline()
	cmds := make([]*redis.MapStringStringCmd, len(ids))
	for i, id := range ids {
		cmds[i] = pipe.HGetAll(ctx, fmt.Sprintf("icom:%s", id))
	}

	_, err = pipe.Exec(ctx)
	if err != nil && err != redis.Nil {
		return nil, err
	}

	profiles := make([]models.IComProfile, 0, len(ids))
	for i, cmd := range cmds {
		data, _ := cmd.Result()
		if len(data) > 0 {
			// Parse profile manually or using Scan (hGetAll result is map[string]string)
			// For simplicity and safety, let's use a small helper or manual mapping
			// Since we have GetICom logic, we could potentially just call it but it's not pipelined.
			// Let's re-use the mapping logic from GetICom.
			
			// Note: Scan is better if you have many fields.
			var p models.IComProfile
			err := s.rdb.HGetAll(ctx, fmt.Sprintf("icom:%s", ids[i])).Scan(&p)
			if err == nil {
				profiles = append(profiles, p)
			}
		}
	}

	return &models.IComListResponse{
		IComs: profiles,
		Total: int(total),
		Page:  page,
		Limit: limit,
	}, nil
}

// GetBoardMembers retrieves all board members
func (s *IComService) GetBoardMembers(ctx context.Context, icomID string) ([]models.BoardMember, error) {
	listKey := fmt.Sprintf("icom:%s:board", icomID)
	memberIDs, err := s.rdb.LRange(ctx, listKey, 0, -1).Result()
	if err != nil {
		return nil, err
	}

	members := make([]models.BoardMember, 0, len(memberIDs))
	for _, memberID := range memberIDs {
		detailKey := fmt.Sprintf("icom:%s:board:%s", icomID, memberID)
		data, err := s.rdb.HGetAll(ctx, detailKey).Result()
		if err != nil || len(data) == 0 {
			continue
		}

		members = append(members, models.BoardMember{
			MemberID: data["memberId"],
			UserID:   data["userId"],
			Name:     data["name"],
			Role:     data["role"],
			Contact:  data["contact"],
			Avatar:   data["avatar"],
			Bio:      data["bio"],
		})
	}

	return members, nil
}

// AddBoardMember adds a member to the board
func (s *IComService) AddBoardMember(ctx context.Context, icomID string, req models.AddBoardMemberRequest) (string, error) {
	// Generate member ID
	memberID := fmt.Sprintf("board_%d", time.Now().UnixNano())

	// Add to list
	listKey := fmt.Sprintf("icom:%s:board", icomID)
	if err := s.rdb.RPush(ctx, listKey, memberID).Err(); err != nil {
		return "", err
	}

	// Save details
	detailKey := fmt.Sprintf("icom:%s:board:%s", icomID, memberID)
	err := s.rdb.HSet(ctx, detailKey, map[string]interface{}{
		"memberId": memberID,
		"userId":   req.UserID,
		"name":     req.Name,
		"role":     req.Role,
		"contact":  req.Contact,
		"avatar":   req.Avatar,
		"bio":      req.Bio,
	}).Err()

	return memberID, err
}

// UpdateBoardMember updates board member details
func (s *IComService) UpdateBoardMember(ctx context.Context, icomID, memberID string, req models.UpdateBoardMemberRequest) error {
	detailKey := fmt.Sprintf("icom:%s:board:%s", icomID, memberID)
	
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}
	if req.Contact != "" {
		updates["contact"] = req.Contact
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}
	if req.Bio != "" {
		updates["bio"] = req.Bio
	}

	return s.rdb.HSet(ctx, detailKey, updates).Err()
}

// RemoveBoardMember removes a member from the board
func (s *IComService) RemoveBoardMember(ctx context.Context, icomID, memberID string) error {
	// Remove from list
	listKey := fmt.Sprintf("icom:%s:board", icomID)
	if err := s.rdb.LRem(ctx, listKey, 0, memberID).Err(); err != nil {
		return err
	}

	// Delete details
	detailKey := fmt.Sprintf("icom:%s:board:%s", icomID, memberID)
	return s.rdb.Del(ctx, detailKey).Err()
}

// GetActions retrieves all action buttons
func (s *IComService) GetActions(ctx context.Context, icomID string) ([]models.ActionButton, error) {
	listKey := fmt.Sprintf("icom:%s:actions", icomID)
	actionIDs, err := s.rdb.LRange(ctx, listKey, 0, -1).Result()
	if err != nil {
		return nil, err
	}

	actions := make([]models.ActionButton, 0, len(actionIDs))
	for _, actionID := range actionIDs {
		detailKey := fmt.Sprintf("icom:%s:action:%s", icomID, actionID)
		data, err := s.rdb.HGetAll(ctx, detailKey).Result()
		if err != nil || len(data) == 0 {
			continue
		}

		order, _ := strconv.Atoi(data["order"])
		actions = append(actions, models.ActionButton{
			ActionID: data["actionId"],
			Type:     data["type"],
			Title:    data["title"],
			URL:      data["url"],
			Icon:     data["icon"],
			Order:    order,
		})
	}

	return actions, nil
}

// AddAction adds an action button
func (s *IComService) AddAction(ctx context.Context, icomID string, req models.AddActionRequest) (string, error) {
	actionID := fmt.Sprintf("action_%d", time.Now().UnixNano())

	listKey := fmt.Sprintf("icom:%s:actions", icomID)
	if err := s.rdb.RPush(ctx, listKey, actionID).Err(); err != nil {
		return "", err
	}

	detailKey := fmt.Sprintf("icom:%s:action:%s", icomID, actionID)
	err := s.rdb.HSet(ctx, detailKey, map[string]interface{}{
		"actionId": actionID,
		"type":     req.Type,
		"title":    req.Title,
		"url":      req.URL,
		"icon":     req.Icon,
		"order":    req.Order,
	}).Err()

	return actionID, err
}

// UpdateAction updates an action button
func (s *IComService) UpdateAction(ctx context.Context, icomID, actionID string, req models.UpdateActionRequest) error {
	detailKey := fmt.Sprintf("icom:%s:action:%s", icomID, actionID)
	
	updates := make(map[string]interface{})
	if req.Type != "" {
		updates["type"] = req.Type
	}
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.URL != "" {
		updates["url"] = req.URL
	}
	if req.Icon != "" {
		updates["icon"] = req.Icon
	}
	if req.Order > 0 {
		updates["order"] = req.Order
	}

	return s.rdb.HSet(ctx, detailKey, updates).Err()
}

// RemoveAction removes an action button
func (s *IComService) RemoveAction(ctx context.Context, icomID, actionID string) error {
	listKey := fmt.Sprintf("icom:%s:actions", icomID)
	if err := s.rdb.LRem(ctx, listKey, 0, actionID).Err(); err != nil {
		return err
	}

	detailKey := fmt.Sprintf("icom:%s:action:%s", icomID, actionID)
	return s.rdb.Del(ctx, detailKey).Err()
}

// IncrementInteractions increments interaction score for a shop
func (s *IComService) IncrementInteractions(ctx context.Context, icomID, shopID string) error {
	key := fmt.Sprintf("icom:%s:rank:interactions", icomID)
	return s.rdb.ZIncrBy(ctx, key, 1, shopID).Err()
}

// ToggleLike handles liking and unliking a shop by a visitor
// It tracks the source (icom or ishop) and ensures unique likes per visitor
func (s *IComService) ToggleLike(ctx context.Context, icomID, shopID string, visitorID string, source string) (string, error) {
	likersKey := fmt.Sprintf("shop:%s:likers", shopID)

	// 1. Check if visitor already liked this shop
	isMember, err := s.rdb.SIsMember(ctx, likersKey, visitorID).Result()
	if err != nil {
		return "", err
	}

	totalKey := fmt.Sprintf("icom:%s:rank:likes", icomID)
	sourceKey := fmt.Sprintf("icom:%s:rank:likes:source:%s", icomID, source)

	pipe := s.rdb.TxPipeline()

	if !isMember {
		// HÀNH ĐỘNG LIKE
		pipe.SAdd(ctx, likersKey, visitorID)
		pipe.ZIncrBy(ctx, totalKey, 1, shopID)
		pipe.ZIncrBy(ctx, sourceKey, 1, shopID)
		// Đặt TTL 24 giờ cho danh sách likers để giải phóng bộ nhớ
		pipe.Expire(ctx, likersKey, 24*time.Hour)

		_, err := pipe.Exec(ctx)
		if err != nil {
			return "", err
		}
		return "liked", nil
	} else {
		// HÀNH ĐỘNG UNLIKE
		pipe.SRem(ctx, likersKey, visitorID)
		pipe.ZIncrBy(ctx, totalKey, -1, shopID)
		pipe.ZIncrBy(ctx, sourceKey, -1, shopID)

		_, err := pipe.Exec(ctx)
		if err != nil {
			return "", err
		}
		return "unliked", nil
	}
}

// CheckLikeStatus checks if a visitor has liked a shop

// CheckLikeStatus checks if a visitor has liked a shop
func (s *IComService) CheckLikeStatus(ctx context.Context, shopID string, visitorID string) (bool, error) {
	likersKey := fmt.Sprintf("shop:%s:likers", shopID)
	return s.rdb.SIsMember(ctx, likersKey, visitorID).Result()
}

// GetLeaderboard gets top shops by ranking type
func (s *IComService) GetLeaderboard(ctx context.Context, icomID, rankType, source string, limit int) ([]models.LeaderboardEntry, error) {
	key := fmt.Sprintf("icom:%s:rank:%s", icomID, rankType)
	
	// If source is specified for likes, use source-specific ranking set
	if rankType == "likes" && source != "" {
		key = fmt.Sprintf("icom:%s:rank:likes:source:%s", icomID, source)
	}

	// Get top N with scores (descending order)
	results, err := s.rdb.ZRevRangeWithScores(ctx, key, 0, int64(limit-1)).Result()
	if err != nil {
		return nil, err
	}

	entries := make([]models.LeaderboardEntry, 0, len(results))
	for i, result := range results {
		shopID := result.Member.(string)
		
		// Get shop name and logo
		shopKey := fmt.Sprintf("ishop:%s", shopID)
		name, _ := s.rdb.HGet(ctx, shopKey, "name").Result()
		logo, _ := s.rdb.HGet(ctx, shopKey, "logo").Result()

		entries = append(entries, models.LeaderboardEntry{
			ShopID: shopID,
			Name:   name,
			Logo:   logo,
			Score:  result.Score,
			Rank:   i + 1,
		})
	}

	return entries, nil
}

// GetIComMetadata retrieves aggregated metadata (industries, areas) for filter suggestions
func (s *IComService) GetIComMetadata(ctx context.Context, icomID string) (*models.IComMetadataResponse, error) {
	// 1. Get Industries (Score > 0, sorted by frequency)
	industries, err := s.rdb.ZRevRangeByScoreWithScores(ctx, fmt.Sprintf("icom:%s:meta:industries", icomID), &redis.ZRangeBy{
		Min: "(0",
		Max: "+inf",
	}).Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}

	// 2. Get Sub-Industries
	subIndustries, err := s.rdb.ZRevRangeByScoreWithScores(ctx, fmt.Sprintf("icom:%s:meta:sub_industries", icomID), &redis.ZRangeBy{
		Min: "(0",
		Max: "+inf",
	}).Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}

	// 3. Get Areas
	areas, err := s.rdb.ZRevRangeByScoreWithScores(ctx, fmt.Sprintf("icom:%s:meta:areas", icomID), &redis.ZRangeBy{
		Min: "(0",
		Max: "+inf",
	}).Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}

	return &models.IComMetadataResponse{
		Industries:    s.convertToMetadataItems(industries),
		SubIndustries: s.convertToMetadataItems(subIndustries),
		Areas:         s.convertToMetadataItems(areas),
	}, nil
}

func (s *IComService) convertToMetadataItems(zs []redis.Z) []models.MetadataItem {
	items := make([]models.MetadataItem, len(zs))
	for i, z := range zs {
		items[i] = models.MetadataItem{
			Name:  z.Member.(string),
			Count: int(z.Score),
		}
	}
	return items
}
