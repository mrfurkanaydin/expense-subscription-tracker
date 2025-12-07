package expenses

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler {
	return &Handler{repo: repo}
}

type createExpenseRequest struct {
	UserID   string  `json:"user_id"`
	Title    string  `json:"title"`
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
	Category string  `json:"category"`
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req createExpenseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	if req.UserID == "" || req.Title == "" || req.Amount <= 0 || req.Currency == "" || req.Category == "" {
		http.Error(w, "invalid input", http.StatusBadRequest)
		return
	}

	userUUID, err := uuid.Parse(req.UserID)
	if err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	exp := &Expense{
		UserID:   userUUID,
		Title:    req.Title,
		Amount:   req.Amount,
		Currency: req.Currency,
		Category: req.Category,
	}

	createdExp, err := h.repo.Create(context.Background(), exp)
	if err != nil {
		http.Error(w, "could not create expense", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdExp)
}

func (h *Handler) GetByUserID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "user_id query param required", http.StatusBadRequest)
		return
	}

	expenses, err := h.repo.GetByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, "could not fetch expenses", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(expenses)
}
