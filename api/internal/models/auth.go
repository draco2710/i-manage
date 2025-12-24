package models

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

type CheckEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  string `json:"user"`
}

type User struct {
	Email    string `json:"email" redis:"email"`
	Password string `json:"-" redis:"password"`
	Name     string `json:"name" redis:"name"`
	Status   string `json:"status" redis:"status"`
	LastLogin string `json:"last_lg" redis:"last_lg"` 
}
