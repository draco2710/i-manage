package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"i-manage/internal/models"
	"i-manage/internal/services"
)

// CreateIShop godoc
// @Summary      Create iShop
// @Description  Create a new iShop (store card)
// @Tags         ishop
// @Accept       json
// @Produce      json
// @Param        request body models.CreateIShopRequest true "iShop creation request"
// @Success      201  {object}  models.IShopProfile
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /ishop [post]
// @Security     CookieAuth
func CreateIShop(c *gin.Context) {
	var req models.CreateIShopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIShopService()
	profile, err := service.CreateIShop(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, profile)
}

// GetIShop godoc
// @Summary      Get iShop
// @Description  Get iShop details
// @Tags         ishop
// @Accept       json
// @Produce      json
// @Param        id path string true "iShop ID"
// @Success      200  {object}  models.IShopProfile
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /ishop/{id} [get]
// @Security     CookieAuth
func GetIShop(c *gin.Context) {
	id := c.Param("id")

	service := services.NewIShopService()
	profile, err := service.GetIShop(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateIShop godoc
// @Summary      Update iShop
// @Description  Update iShop profile
// @Tags         ishop
// @Accept       json
// @Produce      json
// @Param        id path string true "iShop ID"
// @Param        request body models.UpdateIShopRequest true "Update request"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /ishop/{id} [put]
// @Security     CookieAuth
func UpdateIShop(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateIShopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIShopService()
	if err := service.UpdateIShop(c.Request.Context(), id, req); err != nil {
		if err.Error() == "iShop not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "iShop updated successfully"})
}

// DeleteIShop godoc
// @Summary      Delete iShop
// @Description  Delete iShop and remove from all iComs
// @Tags         ishop
// @Accept       json
// @Produce      json
// @Param        id path string true "iShop ID"
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /ishop/{id} [delete]
// @Security     CookieAuth
func DeleteIShop(c *gin.Context) {
	id := c.Param("id")

	service := services.NewIShopService()
	if err := service.DeleteIShop(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "iShop deleted successfully"})
}

// ListIShopMemberships godoc
// @Summary      List iShop Memberships
// @Description  List all iCom memberships for a shop
// @Tags         ishop
// @Accept       json
// @Produce      json
// @Param        id path string true "iShop ID"
// @Success      200  {object}  []models.IShopMembershipInfo
// @Failure      500  {object}  map[string]string
// @Router       /ishop/{id}/memberships [get]
// @Security     CookieAuth
func ListIShopMemberships(c *gin.Context) {
	id := c.Param("id")

	service := services.NewIShopService()
	memberships, err := service.GetMemberships(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if memberships == nil {
		memberships = []models.IShopMembershipInfo{}
	}

	c.JSON(http.StatusOK, memberships)
}
