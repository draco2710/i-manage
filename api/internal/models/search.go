package models

type IShop struct {
	ID      int64  `json:"id"`
	IShopID int64  `json:"ishop_id"`
	// Name might not be in the Countids list, but we fetch it from QRIDs detail?
	// User doc says: GET /api/QRIDs/{id} returns ownerName. 
	// The Countids list only has ishopId and id.
	// We might need a combined struct or just return what we have.
	// Let's add OwnerName for the detail view.
	OwnerName string `json:"owner_name,omitempty"`
}

type ICard struct {
	ID        int64       `json:"id"`
	PackageID string      `json:"package_id"` // API returns string
	Private   interface{} `json:"private"`    // API returns number or string
	Status    string      `json:"status"`
	CardType  string      `json:"card_type"`
	OwnerName string      `json:"owner_name"`
}
