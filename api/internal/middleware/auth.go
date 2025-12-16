package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"i-manage/internal/database"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Retrieve Token from Cookie
		token, err := c.Cookie("token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: No token provided"})
			return
		}

		// 2. Validate Token in Redis
		// Check if key "token:<token>" exists
		tokenKey := fmt.Sprintf("token:%s", token)
		exists, err := database.Rdb.Exists(c, tokenKey).Result()
		
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
			return
		}

		if exists == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Invalid or expired token"})
			return
		}

		// Optional: We could get the email and set it in context if needed
		// email, _ := database.Rdb.Get(c, tokenKey).Result()
		// c.Set("user_email", email)

		c.Next()
	}
}
