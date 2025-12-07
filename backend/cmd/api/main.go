package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/users"
)

func main() {

	envPaths := []string{"../.env", "../../.env", ".env"}
	var envLoaded bool
	for _, path := range envPaths {
		if err := godotenv.Load(path); err == nil {
			envLoaded = true
			break
		}
	}
	if !envLoaded {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	if err := db.Connect(); err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	userRepo := users.NewPostgresRepository()
	userHandler := users.NewHandler(userRepo)

	mux.HandleFunc("/users", userHandler.Create)

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"okey"}`))
	})

	log.Println("server started on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
