package incomes

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Handler struct {
	repo IncomeRepository
}

func NewHandler(repo IncomeRepository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateIncomeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	incomeDate, err := time.Parse("2006-01-02", req.IncomeDate)
	if err != nil {
		http.Error(w, "invalid income_date format (use YYYY-MM-DD)", http.StatusBadRequest)
		return
	}

	income := &Income{
		UserID:          req.UserID,
		Title:           req.Title,
		Amount:          req.Amount,
		Currency:        req.Currency,
		Category:        req.Category,
		IsRecurring:     req.IsRecurring,
		RecurringPeriod: req.RecurringPeriod,
		IncomeDate:      incomeDate,
		Notes:           req.Notes,
	}

	if err := h.repo.Create(r.Context(), income); err != nil {
		http.Error(w, "failed to create income", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(income)
}

func (h *Handler) GetByUserID(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	incomes, err := h.repo.GetByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get incomes", http.StatusInternalServerError)
		return
	}

	if incomes == nil {
		incomes = []Income{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(incomes)
}

func (h *Handler) GetSummary(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	summary, err := h.repo.GetSummary(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get income summary", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var req UpdateIncomeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.repo.Update(r.Context(), id, &req); err != nil {
		http.Error(w, "failed to update income", http.StatusInternalServerError)
		return
	}

	income, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "failed to get updated income", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(income)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := h.repo.Delete(r.Context(), id); err != nil {
		http.Error(w, "failed to delete income", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
