package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"i-manage/internal/models"
)

const BaseURL = "https://api.qrcare.net/api"

// Helper to fetch JSON
func fetchJSON(url string, target interface{}) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	return json.NewDecoder(resp.Body).Decode(target)
}

// SeedData godoc
// @Summary      (Deprecated) Seed dummy data
// @Description  This endpoint is deprecated as we now use external API
// @Tags         debug
// @Produce      json
// @Success      200  {object}  map[string]string "Success"
// @Router       /debug/seed [post]
func SeedData(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Seed data is deprecated. Using live API."})
}

// SearchIShop godoc
// @Summary      Search iShop by Suffix
// @Description  Find iShops ending with the provided suffix from api.qrcare.net
// @Tags         search
// @Produce      json
// @Param        suffix query string true "Suffix (e.g. 4, 5, 6 digits)"
// @Security     CookieAuth
// @Success      200  {array}  models.IShop
// @Router       /search/ishop [get]
func SearchIShop(c *gin.Context) {
	suffix := c.Query("suffix")
	if suffix == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Suffix is required"})
		return
	}

	// 1. Fetch List of Countids
	// GET /api/Countids?filter[fields][ishopId]=true
	listURL := fmt.Sprintf("%s/Countids?filter[fields][ishopId]=true", BaseURL)
	fmt.Printf("[DEBUG] Fetching iShop list from: %s\n", listURL)
	
	var list []models.IShop
	if err := fetchJSON(listURL, &list); err != nil {
		fmt.Printf("[ERROR] Failed to fetch iShop list: %v\n", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch from external API: " + err.Error()})
		return
	}
	fmt.Printf("[DEBUG] Fetched %d iShops from API\n", len(list))

	// 2. Filter by Suffix and collect matches
	var matches []models.IShop
	for _, item := range list {
		// Convert ID to string to check suffix
		idStr := fmt.Sprintf("%d", item.IShopID)
		if strings.HasSuffix(idStr, suffix) {
			matches = append(matches, item)
		}
	}
	fmt.Printf("[DEBUG] Found %d matching iShops for suffix '%s'\n", len(matches), suffix)

	if len(matches) == 0 {
		c.JSON(http.StatusOK, []models.IShop{})
		return
	}

	// 3. Return matches directly (User requested to skip detail fetch)
	fmt.Printf("[DEBUG] Returning %d matching iShops\n", len(matches))
	c.JSON(http.StatusOK, matches)
}

// SearchICard godoc
// @Summary      Search iCard by Suffix
// @Description  Find iCards ending with the provided suffix from api.qrcare.net
// @Tags         search
// @Produce      json
// @Param        suffix query string true "Suffix (e.g. 4, 5, 6 digits)"
// @Security     CookieAuth
// @Success      200  {array}  models.ICard
// @Router       /search/icard [get]
func SearchICard(c *gin.Context) {
	suffix := c.Query("suffix")
	if suffix == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Suffix is required"})
		return
	}

	// 1. Fetch List
	// GET /api/QRIDs?filter[fields][id]=true...
	url := fmt.Sprintf("%s/QRIDs?filter[fields][id]=true&filter[fields][cardType]=true&filter[fields][ownerName]=true&filter[fields][packageId]=true&filter[fields][private]=true", BaseURL)
	fmt.Printf("[DEBUG] Fetching iCard list from: %s\n", url)
	
	var allCards []models.ICard
	if err := fetchJSON(url, &allCards); err != nil {
		fmt.Printf("[ERROR] Failed to fetch iCard list: %v\n", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch from external API: " + err.Error()})
		return
	}
	fmt.Printf("[DEBUG] Fetched %d iCards from API\n", len(allCards))

	// 2. Filter by Suffix
	var results []models.ICard
	for _, card := range allCards {
		idStr := strconv.FormatInt(card.ID, 10)
		if strings.HasSuffix(idStr, suffix) {
			results = append(results, card)
		}
	}
	fmt.Printf("[DEBUG] Found %d matching iCards for suffix '%s'\n", len(results), suffix)

	c.JSON(http.StatusOK, results)
}
