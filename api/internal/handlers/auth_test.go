package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"i-manage/internal/models"
)

func TestRegisterEmailValidation(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		email          string
		username       string
		password       string
		expectedStatus int
		shouldFail     bool
	}{
		{
			name:           "Valid email",
			email:          "valid@example.com",
			username:       "Test User",
			password:       "password123",
			expectedStatus: http.StatusInternalServerError, // Will fail at DB level, but pass validation
			shouldFail:     false,
		},
		{
			name:           "Invalid email - missing @",
			email:          "invalidemail.com",
			username:       "Test User",
			password:       "password123",
			expectedStatus: http.StatusBadRequest,
			shouldFail:     true,
		},
		{
			name:           "Invalid email - missing domain",
			email:          "invalid@",
			username:       "Test User",
			password:       "password123",
			expectedStatus: http.StatusBadRequest,
			shouldFail:     true,
		},
		{
			name:           "Invalid email - spaces",
			email:          "invalid email@example.com",
			username:       "Test User",
			password:       "password123",
			expectedStatus: http.StatusBadRequest,
			shouldFail:     true,
		},
		{
			name:           "Invalid email - no domain extension",
			email:          "invalid@example",
			username:       "Test User",
			password:       "password123",
			expectedStatus: http.StatusBadRequest,
			shouldFail:     true,
		},
		{
			name:           "Empty email",
			email:          "",
			username:       "Test User",
			password:       "password123",
			expectedStatus: http.StatusBadRequest,
			shouldFail:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a test request body
			reqBody := models.RegisterRequest{
				Email:    tt.email,
				Username: tt.username,
				Password: tt.password,
			}

			jsonBody, _ := json.Marshal(reqBody)
			req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")

			// Create a response recorder
			w := httptest.NewRecorder()

			// Create a test router
			router := gin.New()
			router.POST("/api/v1/auth/register", Register)

			// Perform the request
			router.ServeHTTP(w, req)

			// Check if validation failed as expected
			if tt.shouldFail {
				if w.Code != tt.expectedStatus {
					t.Errorf("Expected status %d for %s, got %d", tt.expectedStatus, tt.name, w.Code)
				}

				// Check error message contains validation info
				var response map[string]interface{}
				json.Unmarshal(w.Body.Bytes(), &response)
				if response["error"] == nil {
					t.Errorf("Expected error message for %s", tt.name)
				}
			} else {
				// For valid email, it should pass validation but may fail at DB level
				// Status should NOT be 400 (validation error)
				if w.Code == http.StatusBadRequest {
					var response map[string]interface{}
					json.Unmarshal(w.Body.Bytes(), &response)
					t.Errorf("Valid email failed validation: %v", response)
				}
			}
		})
	}
}
