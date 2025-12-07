package subscriptions

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler {
	return &Handler{repo: repo}
}

type createSubscriptionRequest struct {
	UserID        string  `json:"user_id"`
	Title         string  `json:"title"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	BillingPeriod string  `json:"billing_period"`  // monthly / yearly
	NextBillingAt string  `json:"next_billing_at"` // ISO timestamp
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req createSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	if req.UserID == "" || req.Title == "" || req.Amount <= 0 || req.Currency == "" || (req.BillingPeriod != "monthly" && req.BillingPeriod != "yearly") || req.NextBillingAt == "" {
		http.Error(w, "invalid input", http.StatusBadRequest)
		return
	}

	userUUID, err := uuid.Parse(req.UserID)
	if err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	nextBilling, err := time.Parse(time.RFC3339, req.NextBillingAt)
	if err != nil {
		http.Error(w, "invalid next_billing_at", http.StatusBadRequest)
		return
	}

	sub := &Subscription{
		UserID:        userUUID,
		Title:         req.Title,
		Amount:        req.Amount,
		Currency:      req.Currency,
		BillingPeriod: req.BillingPeriod,
		NextBillingAt: nextBilling,
		Active:        true,
	}

	createdSub, err := h.repo.Create(r.Context(), sub)
	if err != nil {
		http.Error(w, "could not create subscription", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdSub)
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

	subs, err := h.repo.GetByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, "could not fetch subscriptions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subs)
}
