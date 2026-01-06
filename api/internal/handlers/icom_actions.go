package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"i-manage/internal/models"
	"i-manage/internal/services"
)

// AddAction godoc
// @Summary      Add Action Button
// @Description  Add a functional action button
// @Tags         icom-actions
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        request body models.AddActionRequest true "Action details"
// @Success      201  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/actions [post]
// @Security     CookieAuth
func AddAction(c *gin.Context) {
	icomID := c.Param("id")

	var req models.AddActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIComService()
	actionID, err := service.AddAction(c.Request.Context(), icomID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Action added successfully",
		"action_id": actionID,
	})
}

// UpdateAction godoc
// @Summary      Update Action Button
// @Description  Update action button information
// @Tags         icom-actions
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        action_id path string true "Action ID"
// @Param        request body models.UpdateActionRequest true "Update details"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/actions/{action_id} [put]
// @Security     CookieAuth
func UpdateAction(c *gin.Context) {
	icomID := c.Param("id")
	actionID := c.Param("action_id")

	var req models.UpdateActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIComService()
	if err := service.UpdateAction(c.Request.Context(), icomID, actionID, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Action updated successfully"})
}

// RemoveAction godoc
// @Summary      Remove Action Button
// @Description  Delete an action button
// @Tags         icom-actions
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        action_id path string true "Action ID"
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/actions/{action_id} [delete]
// @Security     CookieAuth
func RemoveAction(c *gin.Context) {
	icomID := c.Param("id")
	actionID := c.Param("action_id")

	service := services.NewIComService()
	if err := service.RemoveAction(c.Request.Context(), icomID, actionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Action removed successfully"})
}

// ListActions godoc
// @Summary      List Action Buttons
// @Description  Get all action buttons
// @Tags         icom-actions
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Success      200  {object}  []models.ActionButton
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/actions [get]
// @Security     CookieAuth
func ListActions(c *gin.Context) {
	icomID := c.Param("id")

	service := services.NewIComService()
	actions, err := service.GetActions(c.Request.Context(), icomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if actions == nil {
		actions = []models.ActionButton{}
	}

	c.JSON(http.StatusOK, actions)
}
