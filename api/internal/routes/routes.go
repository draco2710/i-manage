package routes

import (
	"github.com/gin-gonic/gin"
	"i-manage/internal/handlers"
	"i-manage/internal/middleware"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	
	// swaggerFiles "github.com/swaggo/files"
	// ginSwagger "github.com/swaggo/gin-swagger"
	// _ "i-manage/docs" // This will be needed after running swag init
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Swagger setup (uncomment after running swag init)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
			auth.POST("/check-email", handlers.CheckEmail)
		}
		
		search := api.Group("/search")
		search.Use(middleware.AuthMiddleware())
		{
			search.GET("/ishop", handlers.SearchIShop)
			search.GET("/icard", handlers.SearchICard)
		}
		
		// Debug routes
		r.POST("/api/v1/debug/seed", handlers.SeedData)
	}

	return r
}
