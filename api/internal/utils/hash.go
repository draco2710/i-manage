package utils

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes the password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash checks if the provided password matches the hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken generates a random token using MD5 of email + timestamp + random bytes
// as per requirement for "custom rule hashing"
func GenerateToken(email string) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	randomStr := hex.EncodeToString(b)
	
	timestamp := time.Now().UnixNano()
	
	data := fmt.Sprintf("%s:%d:%s", email, timestamp, randomStr)
	
	hash := md5.Sum([]byte(data))
	return hex.EncodeToString(hash[:])
}
