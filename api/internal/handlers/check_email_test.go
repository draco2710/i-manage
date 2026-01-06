package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"i-manage/internal/models"
)

func TestCheckEmailValidation(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name      string
		email     string
		shouldErr bool
	}{
		{
			name:      "Valid email",
			email:     "valid@example.com",
			shouldErr: false,
		},
		{
			name:      "Invalid email - missing @",
			email:     "invalidemail.com",
			shouldErr: true,
		},
		{
			name:      "Empty email",
			email:     "",
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create JSON payload
			payload := models.CheckEmailRequest{
				Email: tt.email,
			}
			jsonData, _ := json.Marshal(payload)

			// Create test context
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request = httptest.NewRequest("POST", "/test", bytes.NewBuffer(jsonData))
			c.Request.Header.Set("Content-Type", "application/json")

			// Since CheckEmail connects to DB, we can't call it directly without mocking.
			// Instead, we test the binding logic which is the first step of the handler.
			var req models.CheckEmailRequest
			err := c.ShouldBindJSON(&req)

			if tt.shouldErr {
				if err == nil {
					t.Errorf("Expected validation error for %s, but got none", tt.name)
				}
			} else {
				if err != nil {
					t.Errorf("Expected no validation error for %s, but got: %v", tt.name, err)
				}
			}
		})
	}
}
