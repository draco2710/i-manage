package routes

import (
	"time"

	"github.com/gin-contrib/cors"
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

	// CORS Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "https://i-manage-ru5z.onrender.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "Cookie"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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
		


		// ============================================
		// iCom PUBLIC Routes (Không cần authentication)
		// ============================================
		icomPublic := api.Group("/icom")
		{
			// Xem thông tin iCom
			icomPublic.GET("/:id", handlers.GetICom)
			
			// Xem danh sách thành viên
			icomPublic.GET("/:id/members", handlers.ListMembers)
			icomPublic.POST("/:id/members/filter", handlers.FilterMembers)
			icomPublic.GET("/:id/search", handlers.GlobalSearch)
			icomPublic.GET("/:id/members/:shop_id", handlers.GetMemberDetail)
			
			// Xem bảng xếp hạng & tìm kiếm
			icomPublic.GET("/:id/leaderboard", handlers.GetLeaderboard)
			icomPublic.POST("/:id/geo-search", handlers.GeoSearch)
			
			// Xem Ban Chấp Hành
			icomPublic.GET("/:id/board", handlers.ListBoardMembers)
			
			// Xem các nút chức năng
			icomPublic.GET("/:id/actions", handlers.ListActions)
			icomPublic.GET("/:id/metadata", handlers.GetIComMetadata)
			
			// Tương tác (có thể public hoặc yêu cầu auth tùy logic nghiệp vụ)
			icomPublic.POST("/:id/interactions/:shop_id", handlers.IncrementInteractions)
			icomPublic.POST("/:id/likes/:shop_id", handlers.IncrementLikes)
			icomPublic.GET("/:id/likes/:shop_id/status", handlers.CheckLikeStatus)
		}

		// ============================================
		// iCom ADMIN Routes (Yêu cầu authentication)
		// ============================================
		icomAdmin := api.Group("/icom")
		icomAdmin.Use(middleware.AuthMiddleware())
		{
			// Quản lý Profile iCom
			icomAdmin.GET("", handlers.ListIComs)
			icomAdmin.POST("", handlers.CreateICom)
			icomAdmin.PUT("/:id", handlers.UpdateICom)
			icomAdmin.DELETE("/:id", handlers.DeleteICom)
			icomAdmin.GET("/:id/stats", handlers.GetIComStats)

			// Quản lý Members
			icomAdmin.POST("/:id/members", handlers.AddMember)
			icomAdmin.PUT("/:id/members/:shop_id/status", handlers.UpdateMemberStatus)
			icomAdmin.PUT("/:id/members/order", handlers.UpdateMemberOrders)
			icomAdmin.PUT("/:id/members/:shop_id/order", handlers.UpdateMemberOrder)
			icomAdmin.DELETE("/:id/members/:shop_id", handlers.RemoveMember)

			// Quản lý Ban Chấp Hành
			icomAdmin.POST("/:id/board", handlers.AddBoardMember)
			icomAdmin.PUT("/:id/board/:member_id", handlers.UpdateBoardMember)
			icomAdmin.DELETE("/:id/board/:member_id", handlers.RemoveBoardMember)

			icomAdmin.POST("/:id/actions", handlers.AddAction)
			icomAdmin.PUT("/:id/actions/:action_id", handlers.UpdateAction)
			icomAdmin.DELETE("/:id/actions/:action_id", handlers.RemoveAction)
		}

		// ============================================
		// iShop PUBLIC Routes (Không cần authentication)
		// ============================================
		ishopPublic := api.Group("/ishop")
		{
			// Xem thông tin shop
			ishopPublic.GET("/:id", handlers.GetIShop)
			ishopPublic.GET("/:id/memberships", handlers.ListIShopMemberships)
		}

		// ============================================
		// iShop ADMIN Routes (Yêu cầu authentication)
		// ============================================
		ishopAdmin := api.Group("/ishop")
		ishopAdmin.Use(middleware.AuthMiddleware())
		{
			ishopAdmin.POST("", handlers.CreateIShop)
			ishopAdmin.PUT("/:id", handlers.UpdateIShop)
			ishopAdmin.DELETE("/:id", handlers.DeleteIShop)
		}
		

	}

	return r
}
