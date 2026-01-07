package models

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestEmailValidationWithGinBinding(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name      string
		email     string
		username  string
		password  string
		shouldErr bool
	}{
		{
			name:      "Valid email",
			email:     "valid@example.com",
			username:  "Test User",
			password:  "password123",
			shouldErr: false,
		},
		{
			name:      "Valid email with subdomain",
			email:     "user@subdomain.example.com",
			username:  "Test User",
			password:  "password123",
			shouldErr: false,
		},
		{
			name:      "Invalid email - missing @",
			email:     "invalidemail.com",
			username:  "Test User",
			password:  "password123",
			shouldErr: true,
		},
		{
			name:      "Invalid email - missing domain",
			email:     "invalid@",
			username:  "Test User",
			password:  "password123",
			shouldErr: true,
		},
		{
			name:      "Invalid email - spaces",
			email:     "invalid email@example.com",
			username:  "Test User",
			password:  "password123",
			shouldErr: true,
		},
		{
			name:      "Empty email",
			email:     "",
			username:  "Test User",
			password:  "password123",
			shouldErr: true,
		},
		{
			name:      "Invalid email - double @",
			email:     "invalid@@example.com",
			username:  "Test User",
			password:  "password123",
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create JSON payload
			payload := map[string]string{
				"email":    tt.email,
				"username": tt.username,
				"password": tt.password,
			}
			jsonData, _ := json.Marshal(payload)

			// Create test context
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request = httptest.NewRequest("POST", "/test", bytes.NewBuffer(jsonData))
			c.Request.Header.Set("Content-Type", "application/json")

			// Try to bind the request
			var req RegisterRequest
			err := c.ShouldBindJSON(&req)

			if tt.shouldErr {
				if err == nil {
					t.Errorf("❌ Expected validation error for '%s' (email: %s), but got none", tt.name, tt.email)
				} else {
					t.Logf("✅ Correctly rejected '%s' - Error: %v", tt.name, err)
				}
			} else {
				if err != nil {
					t.Errorf("❌ Expected no validation error for '%s' (email: %s), but got: %v", tt.name, tt.email, err)
				} else {
					t.Logf("✅ Correctly accepted '%s' (email: %s)", tt.name, tt.email)
				}
			}
		})
	}
}
