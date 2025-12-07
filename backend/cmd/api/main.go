package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/expenses"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/middleware"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/subscriptions"
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

	mux.HandleFunc("/users", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			userHandler.Create(w, r)
		case http.MethodGet:
			userHandler.GetByEmail(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	expenseRepo := expenses.NewPostgresRepository()
	expenseHandler := expenses.NewHandler(expenseRepo)

	mux.HandleFunc("/expenses", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			expenseHandler.Create(w, r)
		case http.MethodGet:
			expenseHandler.GetByUserID(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	subRepo := subscriptions.NewPostgresRepository()
	subHandler := subscriptions.NewHandler(subRepo)

	mux.HandleFunc("/subscriptions", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			subHandler.Create(w, r)
		case http.MethodGet:
			subHandler.GetByUserID(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// start reminder checker
	subscriptions.StartReminderChecker(subRepo)

	mux.HandleFunc("/health", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"okey"}`))
	}))

	log.Println("server started on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
