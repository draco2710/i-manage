package models

// IShopProfile represents the core iShop data stored in Redis Hash
type IShopProfile struct {
	// System fields
	ID        string `json:"id" redis:"id"`
	CardType  string `json:"card_type" redis:"cardType"`
	PackageID string `json:"package_id" redis:"packageId"`
	Private   string `json:"private" redis:"private"`

	// Profile fields
	Name        string `json:"name" redis:"name"`
	Description string `json:"description" redis:"description"`
	Logo        string `json:"logo" redis:"logo"`
	Banner      string `json:"banner" redis:"banner"`
	ImageURLs   string `json:"image_urls" redis:"imageUrls"` // JSON array string

	// Address fields
	Province string  `json:"province" redis:"province"`
	District string  `json:"district" redis:"district"`
	Ward     string  `json:"ward" redis:"ward"`
	Street   string  `json:"street" redis:"street"`
	Lat      float64 `json:"lat" redis:"lat"`
	Lng      float64 `json:"lng" redis:"lng"`

	// Contact fields
	Phone   string `json:"phone" redis:"phone"`
	Email   string `json:"email" redis:"email"`
	Website string `json:"website" redis:"website"`

	// Industry fields
	Industry    string `json:"industry" redis:"industry"`
	SubIndustry string `json:"sub_industry" redis:"subIndustry"`

	// Configuration
	Status string `json:"status" redis:"status"`

	// Audit fields
	Created  string `json:"created" redis:"created"`
	Modified string `json:"modified" redis:"modified"`

	// RediSearch indexing
	IComs string `json:"icoms" redis:"icoms"` // Space-separated list of iCom IDs
}

// CreateIShopRequest represents request to create a new iShop
type CreateIShopRequest struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description"`
	Logo        string   `json:"logo"`
	Banner      string   `json:"banner"`
	ImageURLs   []string `json:"image_urls"`

	// Address
	Province string  `json:"province"`
	District string  `json:"district"`
	Ward     string  `json:"ward"`
	Street   string  `json:"street"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`

	// Contact
	Phone   string `json:"phone"`
	Email   string `json:"email" binding:"omitempty,email"`
	Website string `json:"website"`

	// Industry
	Industry    string `json:"industry"`
	SubIndustry string `json:"sub_industry"`
}

// UpdateIShopRequest represents request to update iShop
type UpdateIShopRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Logo        string   `json:"logo"`
	Banner      string   `json:"banner"`
	ImageURLs   []string `json:"image_urls"`

	// Address
	Province string  `json:"province"`
	District string  `json:"district"`
	Ward     string  `json:"ward"`
	Street   string  `json:"street"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`

	// Contact
	Phone   string `json:"phone"`
	Email   string `json:"email" binding:"omitempty,email"`
	Website string `json:"website"`

	// Industry
	Industry    string `json:"industry"`
	SubIndustry string `json:"sub_industry"`
}

// IShopResponse represents full iShop details with memberships
type IShopResponse struct {
	IShopProfile
	Memberships []IShopMembershipInfo `json:"memberships"`
}

// IShopMembershipInfo represents iCom membership info for a shop
type IShopMembershipInfo struct {
	IComID     string  `json:"icom_id"`
	IComName   string  `json:"icom_name"`
	IComLogo   string  `json:"icom_logo"`
	Rank       string  `json:"rank"`
	Status     string  `json:"status"`
	JoinedDate string  `json:"joined_date"`
	Role       string  `json:"role"`
	Score      float64 `json:"score"` // Membership score/timestamp
}
