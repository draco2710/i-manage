package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"i-manage/internal/models"
	"i-manage/internal/services"
)

// AddMember godoc
// @Summary      Add Member to iCom
// @Description  Add a shop to iCom (creates new iShop in this iCom with location details)
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        request body models.AddMemberRequest true "Shop/Member details"
// @Success      201  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/members [post]
// @Security     CookieAuth
func AddMember(c *gin.Context) {
	icomID := c.Param("id")

	var req models.AddMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewMemberService()
	shopID, err := service.AddMember(c.Request.Context(), icomID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Member added successfully",
		"shop_id":  shopID,
	})
}

// RemoveMember godoc
// @Summary      Remove Member from iCom
// @Description  Remove a shop from iCom membership
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        shop_id path string true "Shop ID"
// @Success      200  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/members/{shop_id} [delete]
// @Security     CookieAuth
func RemoveMember(c *gin.Context) {
	icomID := c.Param("id")
	shopID := c.Param("shop_id")

	service := services.NewMemberService()
	if err := service.RemoveMember(c.Request.Context(), icomID, shopID); err != nil {
		if err.Error() == "membership not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed successfully"})
}

// ListMembers godoc
// @Summary      List iCom Members
// @Description  List all members with pagination
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        page query int false "Page number" default(1)
// @Param        limit query int false "Items per page" default(20)
// @Success      200  {object}  models.MemberListResponse
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/members [get]
// @Security     CookieAuth
func ListMembers(c *gin.Context) {
	icomID := c.Param("id")
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	service := services.NewMemberService()
	response, err := service.ListMembers(c.Request.Context(), icomID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// FilterMembers godoc
// @Summary      Filter iCom Members
// @Description  Filter members by name (query), industry, location (province/district/ward), status, rank
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        request body models.FilterMembersRequest true "Filter criteria"
// @Success      200  {object}  models.MemberListResponse
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/members/filter [post]
// @Security     CookieAuth
func FilterMembers(c *gin.Context) {
	icomID := c.Param("id")

	var req models.FilterMembersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewMemberService()
	response, err := service.FilterMembers(c.Request.Context(), icomID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GlobalSearch godoc
// @Summary      Global Search Members (RediSearch)
// @Description  Search members across all fields (name, industry, location) within iCom scope
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        q query string true "Search query"
// @Param        page query int false "Page number" default(1)
// @Param        limit query int false "Items per page" default(20)
// @Success      200  {object}  models.MemberListResponse
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/search [get]
func GlobalSearch(c *gin.Context) {
	icomID := c.Param("id")
	query := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	service := services.NewMemberService()
	response, err := service.GlobalSearch(c.Request.Context(), icomID, query, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetMemberDetail godoc
// @Summary      Get Member Detail
// @Description  Get detailed membership information
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        shop_id path string true "Shop ID"
// @Success      200  {object}  models.MembershipDetail
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/members/{shop_id} [get]
// @Security     CookieAuth
func GetMemberDetail(c *gin.Context) {
	icomID := c.Param("id")
	shopID := c.Param("shop_id")

	service := services.NewMemberService()
	detail, err := service.GetMemberDetail(c.Request.Context(), icomID, shopID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, detail)
}

// UpdateMemberStatus godoc
// @Summary      Update Member Status
// @Description  Update member rank/status in iCom
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        shop_id path string true "Shop ID"
// @Param        request body models.UpdateMemberStatusRequest true "Status update"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/members/{shop_id}/status [put]
// @Security     CookieAuth
func UpdateMemberStatus(c *gin.Context) {
	icomID := c.Param("id")
	shopID := c.Param("shop_id")

	var req models.UpdateMemberStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewMemberService()
	if err := service.UpdateMemberStatus(c.Request.Context(), icomID, shopID, req); err != nil {
		if err.Error() == "membership not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member status updated successfully"})
}

// UpdateMemberOrder godoc
// @Summary      Update Member Display Order
// @Description  Set custom display order for a member (lower numbers appear first)
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        shop_id path string true "Shop ID"
// @Param        request body models.UpdateMemberOrderRequest true "Display order"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/members/{shop_id}/order [put]
// @Security     CookieAuth
func UpdateMemberOrder(c *gin.Context) {
	icomID := c.Param("id")
	shopID := c.Param("shop_id")

	var req models.UpdateMemberOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewMemberService()
	if err := service.UpdateMemberOrder(c.Request.Context(), icomID, shopID, req.DisplayOrder); err != nil {
		if err.Error() == "membership not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member display order updated successfully"})
}

// IncrementInteractions godoc
// @Summary      Increment Interactions
// @Description  Increment interaction score for ranking
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        shop_id path string true "Shop ID"
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/interactions/{shop_id} [post]
// @Security     CookieAuth
func IncrementInteractions(c *gin.Context) {
	icomID := c.Param("id")
	shopID := c.Param("shop_id")

	service := services.NewIComService()
	if err := service.IncrementInteractions(c.Request.Context(), icomID, shopID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Interaction incremented"})
}

// IncrementLikes (ToggleLike) godoc
// @Summary      Toggle Like (Like/Unlike)
// @Description  Toggle like status for a shop by a visitor (guest support)
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        shop_id path string true "Shop ID"
// @Param        request body models.ToggleLikeRequest true "Like details"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/likes/{shop_id} [post]
func IncrementLikes(c *gin.Context) {
	icomID := c.Param("id")
	shopID := c.Param("shop_id")

	var req models.ToggleLikeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIComService()
	status, err := service.ToggleLike(c.Request.Context(), icomID, shopID, req.VisitorID, req.Source)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success",
		"status":  status,
	})
}

// CheckLikeStatus godoc
// @Summary      Check Like Status
// @Description  Check if a visitor has liked a shop
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        shop_id path string true "Shop ID"
// @Param        visitor_id query string true "Visitor ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/likes/{shop_id}/status [get]
func CheckLikeStatus(c *gin.Context) {
	shopID := c.Param("shop_id")
	visitorID := c.Query("visitor_id")

	if visitorID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "visitor_id is required"})
		return
	}

	service := services.NewIComService()
	liked, err := service.CheckLikeStatus(c.Request.Context(), shopID, visitorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"liked": liked,
	})
}

// GeoSearch godoc
// @Summary      Geo Search Members
// @Description  Find shops near a location
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        request body models.GeoSearchRequest true "Geo search parameters"
// @Success      200  {object}  []models.MemberSummary
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/geo-search [post]
// @Security     CookieAuth
func GeoSearch(c *gin.Context) {
	icomID := c.Param("id")

	var req models.GeoSearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewMemberService()
	members, err := service.GeoSearch(c.Request.Context(), icomID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, members)
}

// GetLeaderboard godoc
// @Summary      Get Leaderboard
// @Description  Get top shops by ranking type
// @Tags         icom-members
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        type query string true "Ranking type (interactions or likes)"
// @Param        source query string false "Source filter for likes (icom or ishop)"
// @Param        limit query int false "Number of results" default(10)
// @Success      200  {object}  models.LeaderboardResponse
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/leaderboard [get]
// @Security     CookieAuth
func GetLeaderboard(c *gin.Context) {
	icomID := c.Param("id")
	rankType := c.Query("type")
	source := c.Query("source")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if rankType != "interactions" && rankType != "likes" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ranking type. Use 'interactions' or 'likes'"})
		return
	}

	service := services.NewIComService()
	entries, err := service.GetLeaderboard(c.Request.Context(), icomID, rankType, source, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := models.LeaderboardResponse{
		Type:    rankType,
		Entries: entries,
	}

	c.JSON(http.StatusOK, response)
}
