package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"i-manage/internal/database"
	"i-manage/internal/routes"
	"i-manage/docs"
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

// @BasePath  /api/v1
// @securityDefinitions.apikey CookieAuth
// @in cookie
// @name token

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default environment variables")
	}

	// Initialize Redis connection
	database.InitRedis()
	database.InitRediSearch()

	// Configure Swagger host from environment variable
	swaggerHost := os.Getenv("SWAGGER_HOST")
	if swaggerHost != "" {
		docs.SwaggerInfo.Host = swaggerHost
	}

	r := routes.SetupRouter()

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on :%s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}