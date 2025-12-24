package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"i-manage/internal/database"
	"i-manage/internal/models"
	"i-manage/internal/utils"
)

// Login godoc
// @Summary      User Login
// @Description  Authenticate user and return token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body models.LoginRequest true "Login Credentials"
// @Success      200  {object}  models.AuthResponse
// @Failure      400  {object}  map[string]string "Bad Request"
// @Failure      401  {object}  map[string]string "Unauthorized"
// @Router       /auth/login [post]
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Check if user exists (User Key = email)
	// We assume req.Username is the email as per requirements "key của user tôi set trùng với email"
	userKey := fmt.Sprintf("user:%s", req.Username)
	exists, err := database.Rdb.Exists(c, userKey).Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// 2. Get User Password
	storedPassword, err := database.Rdb.HGet(c, userKey, "password").Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user data"})
		return
	}

	// 3. Compare Password
	if !utils.CheckPasswordHash(req.Password, storedPassword) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// 4. Generate Token
	token := utils.GenerateToken(req.Username)

	// 5. Store Session (Key = session:<email>, Value = Token, Expiry = 2 hours)
	sessionKey := fmt.Sprintf("session:%s", req.Username)
	err = database.Rdb.Set(c, sessionKey, token, 2*time.Hour).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Store Reverse Lookup (Key = token:<token>, Value = email, Expiry = 2 hours)
	// This allows the middleware to validate the token efficiently
	tokenKey := fmt.Sprintf("token:%s", token)
	_ = database.Rdb.Set(c, tokenKey, req.Username, 2*time.Hour).Err()
	
	// Set Cookie
	// output: Set-Cookie: token=<token>; Path=/; Max-Age=7200; HttpOnly
	c.SetCookie("token", token, 7200, "/", "", false, true)

	// 6. Update Last Login
	// We need to store last_lg in the user hash
	// Use RFC3339 or Unix for simplicity, requirement just says "thời điểm đăng nhập"
	_ = database.Rdb.HSet(c, userKey, "last_lg", time.Now().Format(time.RFC3339)).Err()

	// 7. Get User Name for response
	name, _ := database.Rdb.HGet(c, userKey, "name").Result()

	c.JSON(http.StatusOK, models.AuthResponse{
		Token: token,
		User:  name,
	})
}

// Register godoc
// @Summary      User Registration
// @Description  Register a new user account
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body models.RegisterRequest true "Registration Info"
// @Success      201  {object}  models.AuthResponse
// @Failure      400  {object}  map[string]string "Bad Request"
// @Failure      409  {object}  map[string]string "Conflict"
// @Router       /auth/register [post]
func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Check if user already exists
	userKey := fmt.Sprintf("user:%s", req.Email)
	exists, err := database.Rdb.Exists(c, userKey).Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// 2. Hash Password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// 3. Create User in Redis
	// Using HSet to set multiple fields
	user := models.User{
		Email:    req.Email,
		Password: hashedPassword,
		Name:     req.Username, // Mapping Username from request to Name in model
		Status:   "active",     // Default status
	}

	err = database.Rdb.HSet(c, userKey, map[string]interface{}{
		"email":    user.Email,
		"password": user.Password,
		"name":     user.Name,
		"status":   user.Status,
	}).Err()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Auto-login after register? Or just return success?
	// The response model has Token, so we should probably generate one or return empty.
	// For now, let's return empty token and ask to login, or simpler: just return success.
	// Requirements didn't specify auto-login, but typically Register returns a token or success.
	// I'll return success without token for now to be safe, or generate one if needed.
	// Let's stick to "Created" with empty token to encourage explicit login, or auto-login.
	// I will do AUTO-LOGIN for better UX.

	token := utils.GenerateToken(req.Email)
	sessionKey := fmt.Sprintf("session:%s", req.Email)
	// Expiry = 2 hours
	_ = database.Rdb.Set(c, sessionKey, token, 2*time.Hour).Err()
	
	// Store Reverse Lookup
	tokenKey := fmt.Sprintf("token:%s", token)
	_ = database.Rdb.Set(c, tokenKey, req.Email, 2*time.Hour).Err()

	_ = database.Rdb.HSet(c, userKey, "last_lg", time.Now().Format(time.RFC3339)).Err()

	// Set Cookie
	c.SetCookie("token", token, 7200, "/", "", false, true)

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token: token,
		User:  user.Name,
	})
}

// CheckEmail godoc
// @Summary      Check Email Existence
// @Description  Check if an email is already registered
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request body models.CheckEmailRequest true "Email to check"
// @Success      200  {object}  map[string]bool
// @Failure      400  {object}  map[string]string "Bad Request"
// @Failure      500  {object}  map[string]string "Internal Server Error"
// @Router       /auth/check-email [post]
func CheckEmail(c *gin.Context) {
	var req models.CheckEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userKey := fmt.Sprintf("user:%s", req.Email)
	exists, err := database.Rdb.Exists(c, userKey).Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exists": exists > 0,
	})
}
