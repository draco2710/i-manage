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
		redisAddr = "127.0.0.1:6379"
	}

	redisUsername := os.Getenv("REDIS_USERNAME")
	if redisUsername == "" {
		redisUsername = "default"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")
	if redisPassword == "" {
		redisPassword = ""
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

// InitRediSearch ensures the required RediSearch indexes exist
func InitRediSearch() {
	ctx := context.Background()

	// 1. Check if index exists
	// Using FT._LIST which returns a slice of strings
	indexes, err := Rdb.Do(ctx, "FT._LIST").Result()
	if err != nil {
		fmt.Printf("Warning: RediSearch module might not be loaded: %v\n", err)
		return
	}

	indexExists := false
	if idxSlice, ok := indexes.([]interface{}); ok {
		for _, idx := range idxSlice {
			if idx == "idx:ishop" {
				indexExists = true
				break
			}
		}
	}

	if !indexExists {
		fmt.Println("RediSearch index 'idx:ishop' not found. Creating it...")
		// FT.CREATE idx:ishop ON HASH PREFIX 1 ishop: SCHEMA ...
		err = Rdb.Do(ctx, "FT.CREATE", "idx:ishop", "ON", "HASH", "PREFIX", "1", "ishop:", "SCHEMA",
			"name", "TEXT", "WEIGHT", "5.0",
			"industry", "TEXT", "WEIGHT", "2.0",
			"subIndustry", "TEXT", "WEIGHT", "2.0",
			"province", "TEXT",
			"district", "TEXT",
			"ward", "TEXT",
			"icoms", "TAG", "SEPARATOR", " ",
		).Err()

		if err != nil {
			fmt.Printf("Error creating RediSearch index: %v\n", err)
		} else {
			fmt.Println("RediSearch index 'idx:ishop' created successfully.")
		}
	} else {
		fmt.Println("RediSearch index 'idx:ishop' already exists.")
	}
}
