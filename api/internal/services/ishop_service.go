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

// IShopService handles all iShop-related Redis operations
type IShopService struct {
	rdb *redis.Client
}

// NewIShopService creates a new iShop service
func NewIShopService() *IShopService {
	return &IShopService{
		rdb: database.Rdb,
	}
}

// GenerateIShopID generates a unique ID for iShop
func (s *IShopService) GenerateIShopID(ctx context.Context) (string, error) {
	// Format: 100010010 + sequential number
	counter, err := s.rdb.Incr(ctx, "ishop:id:counter").Result()
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("100010010%d", counter), nil
}

// CreateIShop creates a new iShop in Redis
func (s *IShopService) CreateIShop(ctx context.Context, req models.CreateIShopRequest) (*models.IShopProfile, error) {
	// Generate ID
	id, err := s.GenerateIShopID(ctx)
	if err != nil {
		return nil, err
	}

	// Generate private code (8 digits)
	privateCode := fmt.Sprintf("%08d", time.Now().UnixNano()%100000000)

	// Marshal image URLs
	imageURLs, _ := json.Marshal(req.ImageURLs)

	now := time.Now().Format(time.RFC3339)

	// Create profile
	profile := models.IShopProfile{
		ID:          id,
		CardType:    constants.CARD_TYPE_ISHOP,
		PackageID:   "",
		Private:     privateCode,
		Name:        req.Name,
		Description: req.Description,
		Logo:        req.Logo,
		Banner:      req.Banner,
		ImageURLs:   string(imageURLs),
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
		Status:      constants.STATUS_ACTIVE,
		Created:     now,
		Modified:    now,
	}

	// Save to Redis
	key := fmt.Sprintf("ishop:%s", id)
	err = s.rdb.HSet(ctx, key, map[string]interface{}{
		"id":          id,
		"cardType":    profile.CardType,
		"packageId":   profile.PackageID,
		"private":     profile.Private,
		"name":        profile.Name,
		"description": profile.Description,
		"logo":        profile.Logo,
		"banner":      profile.Banner,
		"imageUrls":   profile.ImageURLs,
		"province":    profile.Province,
		"district":    profile.District,
		"ward":        profile.Ward,
		"street":      profile.Street,
		"lat":         profile.Lat,
		"lng":         profile.Lng,
		"phone":       profile.Phone,
		"email":       profile.Email,
		"website":     profile.Website,
		"industry":    profile.Industry,
		"subIndustry": profile.SubIndustry,
		"status":      profile.Status,
		"created":     profile.Created,
		"modified":    profile.Modified,
		"icoms":       "",
	}).Err()

	if err != nil {
		return nil, err
	}

	return &profile, nil
}

// GetIShop retrieves iShop profile from Redis
func (s *IShopService) GetIShop(ctx context.Context, id string) (*models.IShopProfile, error) {
	key := fmt.Sprintf("ishop:%s", id)
	exists, err := s.rdb.Exists(ctx, key).Result()
	if err != nil {
		return nil, err
	}
	if exists == 0 {
		return nil, fmt.Errorf("iShop not found")
	}

	data, err := s.rdb.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	// Parse lat/lng
	lat, _ := strconv.ParseFloat(data["lat"], 64)
	lng, _ := strconv.ParseFloat(data["lng"], 64)

	profile := &models.IShopProfile{
		ID:          data["id"],
		CardType:    data["cardType"],
		PackageID:   data["packageId"],
		Private:     data["private"],
		Name:        data["name"],
		Description: data["description"],
		Logo:        data["logo"],
		Banner:      data["banner"],
		ImageURLs:   data["imageUrls"],
		Province:    data["province"],
		District:    data["district"],
		Ward:        data["ward"],
		Street:      data["street"],
		Lat:         lat,
		Lng:         lng,
		Phone:       data["phone"],
		Email:       data["email"],
		Website:     data["website"],
		Industry:    data["industry"],
		SubIndustry: data["subIndustry"],
		Status:      data["status"],
		Created:     data["created"],
		Modified:    data["modified"],
		IComs:       data["icoms"],
	}

	return profile, nil
}

// UpdateIShop updates iShop profile
func (s *IShopService) UpdateIShop(ctx context.Context, id string, req models.UpdateIShopRequest) error {
	key := fmt.Sprintf("ishop:%s", id)
	exists, err := s.rdb.Exists(ctx, key).Result()
	if err != nil {
		return err
	}
	if exists == 0 {
		return fmt.Errorf("iShop not found")
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
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
	if req.ImageURLs != nil {
		imageURLs, _ := json.Marshal(req.ImageURLs)
		updates["imageUrls"] = string(imageURLs)
	}
	if req.Province != "" {
		updates["province"] = req.Province
	}
	if req.District != "" {
		updates["district"] = req.District
	}
	if req.Ward != "" {
		updates["ward"] = req.Ward
	}
	if req.Street != "" {
		updates["street"] = req.Street
	}
	if req.Lat != 0 {
		updates["lat"] = req.Lat
	}
	if req.Lng != 0 {
		updates["lng"] = req.Lng
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
	if req.Industry != "" {
		updates["industry"] = req.Industry
	}
	if req.SubIndustry != "" {
		updates["subIndustry"] = req.SubIndustry
	}
	// Note: icoms is managed by MemberService

	updates["modified"] = time.Now().Format(time.RFC3339)

	return s.rdb.HSet(ctx, key, updates).Err()
}

// DeleteIShop deletes iShop and removes from all iComs
func (s *IShopService) DeleteIShop(ctx context.Context, id string) error {
	// Get list of iComs this shop belongs to
	icomsKey := fmt.Sprintf("ishop:%s:icoms", id)
	icomIDs, _ := s.rdb.ZRange(ctx, icomsKey, 0, -1).Result()

	// Get shop profile for metadata cleanup
	shopData, _ := s.rdb.HGetAll(ctx, fmt.Sprintf("ishop:%s", id)).Result()
	province := shopData["province"]
	district := shopData["district"]
	industry := shopData["industry"]
	subIndustry := shopData["subIndustry"]

	// Use pipeline
	pipe := s.rdb.Pipeline()

	// Delete main profile
	pipe.Del(ctx, fmt.Sprintf("ishop:%s", id))

	// Delete membership list
	pipe.Del(ctx, icomsKey)

	// Remove from each iCom
	for _, icomID := range icomIDs {
		// Remove from members set
		pipe.ZRem(ctx, fmt.Sprintf("icom:%s:members", icomID), id)
		
		// Optimization: Cleanup Rankings and Geo
		pipe.ZRem(ctx, fmt.Sprintf("icom:%s:rank:interactions", icomID), id)
		pipe.ZRem(ctx, fmt.Sprintf("icom:%s:rank:likes", icomID), id)
		pipe.ZRem(ctx, fmt.Sprintf("icom:%s:geo", icomID), id) // If it exists (legacy)

		// Metadata Aggregation Cleanup (Phase 17)
		if industry != "" {
			pipe.ZIncrBy(ctx, fmt.Sprintf("icom:%s:meta:industries", icomID), -1, industry)
		}
		if subIndustry != "" {
			pipe.ZIncrBy(ctx, fmt.Sprintf("icom:%s:meta:sub_industries", icomID), -1, subIndustry)
		}
		if province != "" {
			pipe.ZIncrBy(ctx, fmt.Sprintf("icom:%s:meta:areas", icomID), -1, province)
		}
		if district != "" {
			pipe.ZIncrBy(ctx, fmt.Sprintf("icom:%s:meta:areas", icomID), -1, district)
		}

		// Delete membership details
		pipe.Del(ctx, fmt.Sprintf("icom:%s:member:%s", icomID, id))
		// Decrement member count
		pipe.HIncrBy(ctx, fmt.Sprintf("icom:%s", icomID), "totalMembers", -1)
	}

	_, err := pipe.Exec(ctx)
	return err
}

// GetMemberships gets all iCom memberships for a shop
func (s *IShopService) GetMemberships(ctx context.Context, shopID string) ([]models.IShopMembershipInfo, error) {
	key := fmt.Sprintf("ishop:%s:icoms", shopID)
	icomIDs, err := s.rdb.ZRangeWithScores(ctx, key, 0, -1).Result()
	if err != nil {
		return nil, err
	}

	memberships := make([]models.IShopMembershipInfo, 0, len(icomIDs))
	for _, z := range icomIDs {
		icomID := z.Member.(string)
		
		// Get iCom details
		icomKey := fmt.Sprintf("icom:%s", icomID)
		icomName, _ := s.rdb.HGet(ctx, icomKey, "name").Result()
		icomLogo, _ := s.rdb.HGet(ctx, icomKey, "logo").Result()

		// Get membership details
		memberKey := fmt.Sprintf("icom:%s:member:%s", icomID, shopID)
		memberData, _ := s.rdb.HGetAll(ctx, memberKey).Result()

		memberships = append(memberships, models.IShopMembershipInfo{
			IComID:     icomID,
			IComName:   icomName,
			IComLogo:   icomLogo,
			Rank:       memberData["rank"],
			Status:     memberData["status"],
			JoinedDate: memberData["joinedDate"],
			Role:       memberData["role"],
			Score:      z.Score,
		})
	}

	return memberships, nil
}
