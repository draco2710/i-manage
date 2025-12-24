package database

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var Rdb *redis.Client

func InitRedis() {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "redis-10120.crce194.ap-seast-1-1.ec2.cloud.redislabs.com:10120"
	}

	redisUsername := os.Getenv("REDIS_USERNAME")
	if redisUsername == "" {
		redisUsername = "default"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")
	if redisPassword == "" {
		redisPassword = "zuBy0yjIu6xaiNuoAjTHevwzlK5gWs4y"
	}
	
	Rdb = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Username: redisUsername,
		Password: redisPassword,
		DB:       0,  // use default DB
	})


	ctx := context.Background()
	_, err := Rdb.Ping(ctx).Result()
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to Redis: %v", err))
	}
	
	fmt.Println("Connected to Redis successfully")
}
