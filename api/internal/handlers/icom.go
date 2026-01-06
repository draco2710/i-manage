package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"i-manage/internal/models"
	"i-manage/internal/services"
)

// CreateICom godoc
// @Summary      Create iCom
// @Description  Create a new iCom (community card)
// @Tags         icom
// @Accept       json
// @Produce      json
// @Param        request body models.CreateIComRequest true "iCom creation request"
// @Success      201  {object}  models.IComProfile
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom [post]
// @Security     CookieAuth
func CreateICom(c *gin.Context) {
	var req models.CreateIComRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIComService()
	profile, err := service.CreateICom(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, profile)
}

// GetICom godoc
// @Summary      Get iCom
// @Description  Get iCom details including board and actions
// @Tags         icom
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Success      200  {object}  models.IComResponse
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id} [get]
// @Security     CookieAuth
func GetICom(c *gin.Context) {
	id := c.Param("id")

	service := services.NewIComService()
	profile, err := service.GetICom(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Get board members
	board, _ := service.GetBoardMembers(c.Request.Context(), id)
	if board == nil {
		board = []models.BoardMember{}
	}

	// Get actions
	actions, _ := service.GetActions(c.Request.Context(), id)
	if actions == nil {
		actions = []models.ActionButton{}
	}

	response := models.IComResponse{
		IComProfile: *profile,
		Board:       board,
		Actions:     actions,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateICom godoc
// @Summary      Update iCom
// @Description  Update iCom profile information
// @Tags         icom
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        request body models.UpdateIComRequest true "Update request"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id} [put]
// @Security     CookieAuth
func UpdateICom(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateIComRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIComService()
	if err := service.UpdateICom(c.Request.Context(), id, req); err != nil {
		if err.Error() == "iCom not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "iCom updated successfully"})
}

// DeleteICom godoc
// @Summary      Delete iCom
// @Description  Delete iCom and all related data
// @Tags         icom
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id} [delete]
// @Security     CookieAuth
func DeleteICom(c *gin.Context) {
	id := c.Param("id")

	service := services.NewIComService()
	if err := service.DeleteICom(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "iCom deleted successfully"})
}

// ListIComs godoc
// @Summary      List all iComs
// @Description  Get a paginated list of all iComs
// @Tags         icom-admin
// @Accept       json
// @Produce      json
// @Param        page query int false "Page number"
// @Param        limit query int false "Items per page"
// @Success      200  {object}  models.IComListResponse
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom [get]
// @Security     CookieAuth
func ListIComs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	service := services.NewIComService()
	response, err := service.ListIComs(c.Request.Context(), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetIComStats godoc
// @Summary      Get iCom Statistics
// @Description  Get statistics for an iCom
// @Tags         icom
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Success      200  {object}  models.IComStatsResponse
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/stats [get]
// @Security     CookieAuth
func GetIComStats(c *gin.Context) {
	id := c.Param("id")

	service := services.NewIComService()
	profile, err := service.GetICom(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	stats := models.IComStatsResponse{
		TotalMembers:      profile.TotalMembers,
		ActiveMembers:     profile.ActiveMembers,
		PendingMembers:    0,
		IndustryBreakdown: make(map[string]int),
		DistrictBreakdown: make(map[string]int),
	}

	c.JSON(http.StatusOK, stats)
}

// GetIComMetadata godoc
// @Summary      Get iCom Filter Metadata
// @Description  Get unique industries and areas within an iCom for filter populating
// @Tags         icom
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "iCom ID"
// @Success      200  {object}  models.IComMetadataResponse
// @Failure      404  {object}  map[string]string
// @Router       /icom/{id}/metadata [get]
func GetIComMetadata(c *gin.Context) {
	id := c.Param("id")
	service := services.NewIComService()

	metadata, err := service.GetIComMetadata(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, metadata)
}
