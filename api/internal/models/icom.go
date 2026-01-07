package models

// IComProfile represents the core iCom data stored in Redis Hash
type IComProfile struct {
	// System fields
	ID        string `json:"id" redis:"id"`
	CardType  string `json:"card_type" redis:"cardType"`
	PackageID string `json:"package_id" redis:"packageId"`
	Private   string `json:"private" redis:"private"`

	// Profile fields
	Name        string `json:"name" redis:"name"`
	FullName    string `json:"full_name" redis:"fullName"`
	Slogan      string `json:"slogan" redis:"slogan"`
	Description string `json:"description" redis:"description"`
	Logo        string `json:"logo" redis:"logo"`
	Banner      string `json:"banner" redis:"banner"`
	ThemeColor  string `json:"theme_color" redis:"themeColor"`

	// Contact fields
	Address string `json:"address" redis:"address"`
	Phone   string `json:"phone" redis:"phone"`
	Email   string `json:"email" redis:"email"`
	Website string `json:"website" redis:"website"`

	// Configuration fields (stored as JSON strings in Redis)
	AllowedIndustries string `json:"allowed_industries" redis:"allowedIndustries"` // JSON array
	OperatingAreas    string `json:"operating_areas" redis:"operatingAreas"`       // JSON array
	Status            string `json:"status" redis:"status"`
	RequireApproval   string `json:"require_approval" redis:"requireApproval"` // "true" or "false"
	AutoActivate      string `json:"auto_activate" redis:"autoActivate"`       // "true" or "false"
	MaxMembers        int    `json:"max_members" redis:"maxMembers"`

	// Statistics
	TotalMembers  int `json:"total_members" redis:"totalMembers"`
	ActiveMembers int `json:"active_members" redis:"activeMembers"`

	// Audit fields
	Created  string `json:"created" redis:"created"`
	Modified string `json:"modified" redis:"modified"`
}

// CreateIComRequest represents request to create a new iCom
type CreateIComRequest struct {
	Name              string   `json:"name" binding:"required"`
	FullName          string   `json:"full_name"`
	Slogan            string   `json:"slogan"`
	Description       string   `json:"description"`
	Logo              string   `json:"logo"`
	Banner            string   `json:"banner"`
	ThemeColor        string   `json:"theme_color"`
	Address           string   `json:"address"`
	Phone             string   `json:"phone"`
	Email             string   `json:"email" binding:"omitempty,email"`
	Website           string   `json:"website"`
	AllowedIndustries []string `json:"allowed_industries"` // Array of industry slugs
	OperatingAreas    []string `json:"operating_areas"`    // Array of area slugs
	RequireApproval   bool     `json:"require_approval"`
	AutoActivate      bool     `json:"auto_activate"`
	MaxMembers        int      `json:"max_members"`
}

// UpdateIComRequest represents request to update iCom
type UpdateIComRequest struct {
	Name              string   `json:"name"`
	FullName          string   `json:"full_name"`
	Slogan            string   `json:"slogan"`
	Description       string   `json:"description"`
	Logo              string   `json:"logo"`
	Banner            string   `json:"banner"`
	ThemeColor        string   `json:"theme_color"`
	Address           string   `json:"address"`
	Phone             string   `json:"phone"`
	Email             string   `json:"email" binding:"omitempty,email"`
	Website           string   `json:"website"`
	AllowedIndustries []string `json:"allowed_industries"`
	OperatingAreas    []string `json:"operating_areas"`
	RequireApproval   *bool    `json:"require_approval"`
	AutoActivate      *bool    `json:"auto_activate"`
	MaxMembers        int      `json:"max_members"`
}

// IComResponse represents the response with full iCom details
type IComResponse struct {
	IComProfile
	Board   []BoardMember  `json:"board"`
	Actions []ActionButton `json:"actions"`
}

// BoardMember represents a member of the board
type BoardMember struct {
	MemberID string `json:"member_id" redis:"memberId"`
	UserID   string `json:"user_id" redis:"userId"`
	Name     string `json:"name" redis:"name"`
	Role     string `json:"role" redis:"role"`
	Contact  string `json:"contact" redis:"contact"`
	Avatar   string `json:"avatar" redis:"avatar"`
	Bio      string `json:"bio" redis:"bio"`
}

// AddBoardMemberRequest represents request to add board member
type AddBoardMemberRequest struct {
	UserID  string `json:"user_id" binding:"required"`
	Name    string `json:"name" binding:"required"`
	Role    string `json:"role" binding:"required"`
	Contact string `json:"contact"`
	Avatar  string `json:"avatar"`
	Bio     string `json:"bio"`
}

// UpdateBoardMemberRequest represents request to update board member
type UpdateBoardMemberRequest struct {
	Name    string `json:"name"`
	Role    string `json:"role"`
	Contact string `json:"contact"`
	Avatar  string `json:"avatar"`
	Bio     string `json:"bio"`
}

// ActionButton represents a functional button/action
type ActionButton struct {
	ActionID string `json:"action_id" redis:"actionId"`
	Type     string `json:"type" redis:"type"`
	Title    string `json:"title" redis:"title"`
	URL      string `json:"url" redis:"url"`
	Icon     string `json:"icon" redis:"icon"`
	Order    int    `json:"order" redis:"order"`
}

// AddActionRequest represents request to add action button
type AddActionRequest struct {
	Type  string `json:"type" binding:"required"`
	Title string `json:"title" binding:"required"`
	URL   string `json:"url" binding:"required"`
	Icon  string `json:"icon"`
	Order int    `json:"order"`
}

// UpdateActionRequest represents request to update action button
type UpdateActionRequest struct {
	Type  string `json:"type"`
	Title string `json:"title"`
	URL   string `json:"url"`
	Icon  string `json:"icon"`
	Order int    `json:"order"`
}

// MembershipDetail represents shop's membership details in an iCom
type MembershipDetail struct {
	ShopID     string `json:"shop_id" redis:"shopId"`
	IComID     string `json:"icom_id" redis:"icomId"`
	IComName   string `json:"icom_name" redis:"icomName"`
	Rank       string `json:"rank" redis:"rank"`
	Status     string `json:"status" redis:"status"`
	JoinedDate string `json:"joined_date" redis:"joinedDate"`
	Role       string `json:"role" redis:"role"`
	Benefits   string `json:"benefits" redis:"benefits"`
}

// AddMemberRequest represents request to add a shop to iCom
// This also creates the iShop if needed
type AddMemberRequest struct {
	// Shop Profile
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description"`
	Logo        string   `json:"logo"`
	Banner      string   `json:"banner"`
	ImageURLs   []string `json:"image_urls"`

	// Address & Geo-location
	Province string  `json:"province"`
	District string  `json:"district"`
	Ward     string  `json:"ward"`
	Street   string  `json:"street"`
	Lat      float64 `json:"lat" binding:"required"` // Required for geo-search and map display
	Lng      float64 `json:"lng" binding:"required"` // Required for geo-search and map display

	// Contact
	Phone   string `json:"phone"`
	Email   string `json:"email" binding:"omitempty,email"`
	Website string `json:"website"`

	// Industry
	Industry    string `json:"industry" binding:"required"`
	SubIndustry string `json:"sub_industry"`

	// Membership details
	Rank   string `json:"rank"`
	Status string `json:"status"`
	Role   string `json:"role"`
}

// UpdateMemberStatusRequest represents request to update member status
type UpdateMemberStatusRequest struct {
	Rank   string `json:"rank"`
	Status string `json:"status"`
	Role   string `json:"role"`
}

// UpdateMemberOrderRequest represents request to update member display order
type UpdateMemberOrderRequest struct {
	DisplayOrder int `json:"display_order" binding:"required,min=1"`
}

// FilterMembersRequest represents request to filter members
type FilterMembersRequest struct {
	Query       string `json:"query"`
	Industry    string `json:"industry"`
	SubIndustry string `json:"sub_industry"`
	Province    string `json:"province"`
	District    string `json:"district"`
	Ward        string `json:"ward"`
	Status      string `json:"status"`
	Rank        string `json:"rank"`
	Page        int    `json:"page"`
	Limit       int    `json:"limit"`
}

// MemberListResponse represents paginated member list
type MemberListResponse struct {
	Members []MemberSummary `json:"members"`
	Total   int             `json:"total"`
	Page    int             `json:"page"`
	Limit   int             `json:"limit"`
}

// MemberSummary represents brief member info in list
type MemberSummary struct {
	ShopID      string  `json:"shop_id"`
	Name        string  `json:"name"`
	Logo        string  `json:"logo"`
	Industry    string  `json:"industry"`
	SubIndustry string  `json:"sub_industry"`
	Province    string  `json:"province"`
	District    string  `json:"district"`
	Ward        string  `json:"ward"`
	Rank        string  `json:"rank"`
	Status      string  `json:"status"`
	JoinedDate  string  `json:"joined_date"`
	Lat         float64 `json:"lat"`
	Lng         float64 `json:"lng"`
}

// GeoSearchRequest represents request for geo-based search
type GeoSearchRequest struct {
	Lat    float64 `json:"lat" binding:"required"`
	Lng    float64 `json:"lng" binding:"required"`
	Radius float64 `json:"radius" binding:"required"` // in kilometers
	Unit   string  `json:"unit"`                      // km or m
}

// LeaderboardEntry represents an entry in leaderboard
// ToggleLikeRequest is the request body for liking/unliking a shop
type ToggleLikeRequest struct {
	VisitorID string `json:"visitor_id" binding:"required"`
	Source    string `json:"source" binding:"required,oneof=icom ishop"`
}

type LeaderboardEntry struct {
	ShopID string  `json:"shop_id"`
	Name   string  `json:"name"`
	Logo   string  `json:"logo"`
	Score  float64 `json:"score"`
	Rank   int     `json:"rank"`
}

// LeaderboardResponse represents leaderboard data
type LeaderboardResponse struct {
	Type    string             `json:"type"` // interactions or likes
	Entries []LeaderboardEntry `json:"entries"`
}

// IComStatsResponse represents iCom statistics
type IComStatsResponse struct {
	TotalMembers      int            `json:"total_members"`
	ActiveMembers     int            `json:"active_members"`
	PendingMembers    int            `json:"pending_members"`
	IndustryBreakdown map[string]int `json:"industry_breakdown"`
	DistrictBreakdown map[string]int `json:"district_breakdown"`
}

// IComListResponse represents paginated list of iComs
type IComListResponse struct {
	IComs []IComProfile `json:"icoms"`
	Total int           `json:"total"`
	Page  int           `json:"page"`
	Limit int           `json:"limit"`
}

type MetadataItem struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type IComMetadataResponse struct {
	Industries    []MetadataItem `json:"industries"`
	SubIndustries []MetadataItem `json:"sub_industries"`
	Areas         []MetadataItem `json:"areas"`
}
