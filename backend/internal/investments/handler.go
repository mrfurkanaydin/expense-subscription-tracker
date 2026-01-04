package investments

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateInvestmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	// Validation
	if req.UserID == "" || req.Type == "" || req.Symbol == "" || req.Name == "" || req.Quantity <= 0 || req.PurchasePrice <= 0 || req.PurchaseDate == "" {
		http.Error(w, "invalid input", http.StatusBadRequest)
		return
	}

	if !IsValidType(req.Type) {
		http.Error(w, "invalid investment type", http.StatusBadRequest)
		return
	}

	userUUID, err := uuid.Parse(req.UserID)
	if err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	purchaseDate, err := time.Parse(time.RFC3339, req.PurchaseDate)
	if err != nil {
		http.Error(w, "invalid purchase_date", http.StatusBadRequest)
		return
	}

	currency := req.PurchaseCurrency
	if currency == "" {
		currency = "TRY"
	}

	inv := &Investment{
		UserID:           userUUID,
		Type:             InvestmentType(req.Type),
		Symbol:           strings.ToUpper(req.Symbol),
		Name:             req.Name,
		Quantity:         req.Quantity,
		PurchasePrice:    req.PurchasePrice,
		PurchaseCurrency: currency,
		PurchaseDate:     purchaseDate,
		Notes:            req.Notes,
	}

	created, err := h.repo.Create(r.Context(), inv)
	if err != nil {
		http.Error(w, "could not create investment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(created)
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

	invType := r.URL.Query().Get("type")

	var investments []*Investment
	var err error

	if invType != "" {
		investments, err = h.repo.GetByUserIDAndType(r.Context(), userID, invType)
	} else {
		investments, err = h.repo.GetByUserID(r.Context(), userID)
	}

	if err != nil {
		http.Error(w, "could not fetch investments", http.StatusInternalServerError)
		return
	}

	if investments == nil {
		investments = []*Investment{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(investments)
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
		http.Error(w, "could not delete investment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
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

	// Get existing investment
	existing, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "investment not found", http.StatusNotFound)
		return
	}

	var req UpdateInvestmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	// Update only provided fields
	if req.Quantity != nil && *req.Quantity > 0 {
		existing.Quantity = *req.Quantity
	}
	if req.PurchasePrice != nil && *req.PurchasePrice > 0 {
		existing.PurchasePrice = *req.PurchasePrice
	}
	if req.PurchaseCurrency != nil && *req.PurchaseCurrency != "" {
		existing.PurchaseCurrency = *req.PurchaseCurrency
	}
	if req.PurchaseDate != nil && *req.PurchaseDate != "" {
		purchaseDate, err := time.Parse(time.RFC3339, *req.PurchaseDate)
		if err == nil {
			existing.PurchaseDate = purchaseDate
		}
	}
	if req.Notes != nil {
		existing.Notes = *req.Notes
	}

	updated, err := h.repo.Update(r.Context(), id, existing)
	if err != nil {
		http.Error(w, "could not update investment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}
