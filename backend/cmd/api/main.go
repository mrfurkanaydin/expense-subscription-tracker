package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/debts"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/expenses"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/incomes"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/investments"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/market"
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
		case http.MethodPut:
			expenseHandler.Update(w, r)
		case http.MethodDelete:
			expenseHandler.Delete(w, r)
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
		case http.MethodPut:
			subHandler.Update(w, r)
		case http.MethodDelete:
			subHandler.Delete(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// Investments
	invRepo := investments.NewPostgresRepository()
	invHandler := investments.NewHandler(invRepo)

	mux.HandleFunc("/investments", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			invHandler.Create(w, r)
		case http.MethodGet:
			invHandler.GetByUserID(w, r)
		case http.MethodPut:
			invHandler.Update(w, r)
		case http.MethodDelete:
			invHandler.Delete(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// Debts
	cardRepo := debts.NewPostgresCreditCardRepository()
	debtRepo := debts.NewPostgresDebtRepository()
	debtHandler := debts.NewHandler(cardRepo, debtRepo)

	mux.HandleFunc("/credit-cards", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			debtHandler.CreateCreditCard(w, r)
		case http.MethodGet:
			debtHandler.GetCreditCardsByUserID(w, r)
		case http.MethodPut:
			debtHandler.UpdateCreditCard(w, r)
		case http.MethodDelete:
			debtHandler.DeleteCreditCard(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	mux.HandleFunc("/debts", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			debtHandler.CreateDebt(w, r)
		case http.MethodGet:
			debtHandler.GetDebtsByUserID(w, r)
		case http.MethodPut:
			debtHandler.UpdateDebt(w, r)
		case http.MethodDelete:
			debtHandler.DeleteDebt(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	mux.HandleFunc("/debts/pay", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			debtHandler.PayInstallment(w, r)
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	mux.HandleFunc("/debts/summary", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			debtHandler.GetDebtSummary(w, r)
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// Incomes
	incomeRepo := incomes.NewPostgresRepository()
	incomeHandler := incomes.NewHandler(incomeRepo)

	mux.HandleFunc("/incomes", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			incomeHandler.Create(w, r)
		case http.MethodGet:
			incomeHandler.GetByUserID(w, r)
		case http.MethodPut:
			incomeHandler.Update(w, r)
		case http.MethodDelete:
			incomeHandler.Delete(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	mux.HandleFunc("/incomes/summary", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			incomeHandler.GetSummary(w, r)
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// Market Data
	marketService := market.NewService()
	marketHandler := market.NewHandler(marketService)
	mux.HandleFunc("/market/gold", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			marketHandler.GetGoldPrices(w, r)
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	mux.HandleFunc("/market/stock", middleware.CORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			marketHandler.GetStockPrice(w, r)
		} else {
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
