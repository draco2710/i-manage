package main

import (
	"log"
	
	"i-manage/internal/database"
	"i-manage/internal/routes"
	_"i-manage/docs"
)

// @title           i-Manage API
// @version         1.0
// @description     This is the API server for i-Manage application.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1
// @securityDefinitions.apikey CookieAuth
// @in cookie
// @name token

func main() {
	// Initialize Redis connection
	database.InitRedis()

	r := routes.SetupRouter()

	log.Println("Starting server on :8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}