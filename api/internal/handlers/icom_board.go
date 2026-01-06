package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"i-manage/internal/models"
	"i-manage/internal/services"
)

// AddBoardMember godoc
// @Summary      Add Board Member
// @Description  Add a member to the board of directors
// @Tags         icom-board
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        request body models.AddBoardMemberRequest true "Board member details"
// @Success      201  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/board [post]
// @Security     CookieAuth
func AddBoardMember(c *gin.Context) {
	icomID := c.Param("id")

	var req models.AddBoardMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIComService()
	memberID, err := service.AddBoardMember(c.Request.Context(), icomID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Board member added successfully",
		"member_id": memberID,
	})
}

// UpdateBoardMember godoc
// @Summary      Update Board Member
// @Description  Update board member information
// @Tags         icom-board
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        member_id path string true "Member ID"
// @Param        request body models.UpdateBoardMemberRequest true "Update details"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/board/{member_id} [put]
// @Security     CookieAuth
func UpdateBoardMember(c *gin.Context) {
	icomID := c.Param("id")
	memberID := c.Param("member_id")

	var req models.UpdateBoardMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := services.NewIComService()
	if err := service.UpdateBoardMember(c.Request.Context(), icomID, memberID, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Board member updated successfully"})
}

// RemoveBoardMember godoc
// @Summary      Remove Board Member
// @Description  Remove a member from the board
// @Tags         icom-board
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Param        member_id path string true "Member ID"
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/board/{member_id} [delete]
// @Security     CookieAuth
func RemoveBoardMember(c *gin.Context) {
	icomID := c.Param("id")
	memberID := c.Param("member_id")

	service := services.NewIComService()
	if err := service.RemoveBoardMember(c.Request.Context(), icomID, memberID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Board member removed successfully"})
}

// ListBoardMembers godoc
// @Summary      List Board Members
// @Description  Get all board members
// @Tags         icom-board
// @Accept       json
// @Produce      json
// @Param        id path string true "iCom ID"
// @Success      200  {object}  []models.BoardMember
// @Failure      500  {object}  map[string]string
// @Router       /icom/{id}/board [get]
// @Security     CookieAuth
func ListBoardMembers(c *gin.Context) {
	icomID := c.Param("id")

	service := services.NewIComService()
	members, err := service.GetBoardMembers(c.Request.Context(), icomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if members == nil {
		members = []models.BoardMember{}
	}

	c.JSON(http.StatusOK, members)
}
