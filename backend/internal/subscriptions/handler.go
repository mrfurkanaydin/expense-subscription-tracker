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
	StartDate     string  `json:"start_date"`      // ISO timestamp, optional
	EndDate       string  `json:"end_date"`        // ISO timestamp, optional
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
		// Try parsing YYYY-MM-DD
		nextBilling, err = time.Parse("2006-01-02", req.NextBillingAt)
		if err != nil {
			http.Error(w, "invalid next_billing_at", http.StatusBadRequest)
			return
		}
	}

	// StartDate default to today if not provided
	startDate := time.Now()
	if req.StartDate != "" {
		parsed, err := time.Parse(time.RFC3339, req.StartDate)
		if err != nil {
			parsed, err = time.Parse("2006-01-02", req.StartDate)
		}
		if err == nil {
			startDate = parsed
		}
	}

	var endDate *time.Time
	if req.EndDate != "" {
		parsed, err := time.Parse(time.RFC3339, req.EndDate)
		if err != nil {
			parsed, err = time.Parse("2006-01-02", req.EndDate)
		}
		if err == nil {
			endDate = &parsed
		}
	}

	sub := &Subscription{
		UserID:        userUUID,
		Title:         req.Title,
		Amount:        req.Amount,
		Currency:      req.Currency,
		BillingPeriod: req.BillingPeriod,
		NextBillingAt: nextBilling,
		StartDate:     startDate,
		EndDate:       endDate,
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

type updateSubscriptionRequest struct {
	Title         *string  `json:"title"`
	Amount        *float64 `json:"amount"`
	Currency      *string  `json:"currency"`
	BillingPeriod *string  `json:"billing_period"`
	NextBillingAt *string  `json:"next_billing_at"`
	StartDate     *string  `json:"start_date"`
	EndDate       *string  `json:"end_date"`
	Active        *bool    `json:"active"`
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "id query param required", http.StatusBadRequest)
		return
	}

	existing, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "subscription not found", http.StatusNotFound)
		return
	}

	var req updateSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	if req.Title != nil {
		existing.Title = *req.Title
	}
	if req.Amount != nil && *req.Amount > 0 {
		existing.Amount = *req.Amount
	}
	if req.Currency != nil {
		existing.Currency = *req.Currency
	}
	if req.BillingPeriod != nil && (*req.BillingPeriod == "monthly" || *req.BillingPeriod == "yearly") {
		existing.BillingPeriod = *req.BillingPeriod
	}
	if req.NextBillingAt != nil {
		nextBilling, err := time.Parse(time.RFC3339, *req.NextBillingAt)
		if err != nil {
			nextBilling, err = time.Parse("2006-01-02", *req.NextBillingAt)
		}
		if err == nil {
			existing.NextBillingAt = nextBilling
		}
	}
	if req.StartDate != nil {
		parsed, err := time.Parse(time.RFC3339, *req.StartDate)
		if err != nil {
			parsed, err = time.Parse("2006-01-02", *req.StartDate)
		}
		if err == nil {
			existing.StartDate = parsed
		}
	}
	if req.EndDate != nil {
		if *req.EndDate == "" {
			existing.EndDate = nil // Clear end date
		} else {
			parsed, err := time.Parse(time.RFC3339, *req.EndDate)
			if err != nil {
				parsed, err = time.Parse("2006-01-02", *req.EndDate)
			}
			if err == nil {
				existing.EndDate = &parsed
			}
		}
	}
	if req.Active != nil {
		existing.Active = *req.Active
	}

	updated, err := h.repo.Update(r.Context(), id, existing)
	if err != nil {
		http.Error(w, "could not update subscription", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "id query param required", http.StatusBadRequest)
		return
	}

	err := h.repo.Delete(r.Context(), id)
	if err != nil {
		http.Error(w, "could not delete subscription", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}
