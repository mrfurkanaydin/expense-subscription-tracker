package debts

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Handler struct {
	cardRepo CreditCardRepository
	debtRepo DebtRepository
}

func NewHandler(cardRepo CreditCardRepository, debtRepo DebtRepository) *Handler {
	return &Handler{cardRepo: cardRepo, debtRepo: debtRepo}
}

// Credit Card Handlers

func (h *Handler) CreateCreditCard(w http.ResponseWriter, r *http.Request) {
	var req CreateCreditCardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	card := &CreditCard{
		UserID:         req.UserID,
		Name:           req.Name,
		BankName:       req.BankName,
		LastFourDigits: req.LastFourDigits,
		StatementDay:   req.StatementDay,
		DueDay:         req.DueDay,
		CreditLimit:    req.CreditLimit,
		Currency:       req.Currency,
		Color:          req.Color,
	}

	if err := h.cardRepo.Create(r.Context(), card); err != nil {
		http.Error(w, "failed to create credit card", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(card)
}

func (h *Handler) GetCreditCardsByUserID(w http.ResponseWriter, r *http.Request) {
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

	cards, err := h.cardRepo.GetByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get credit cards", http.StatusInternalServerError)
		return
	}

	if cards == nil {
		cards = []CreditCard{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cards)
}

func (h *Handler) UpdateCreditCard(w http.ResponseWriter, r *http.Request) {
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

	var req UpdateCreditCardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.cardRepo.Update(r.Context(), id, &req); err != nil {
		http.Error(w, "failed to update credit card", http.StatusInternalServerError)
		return
	}

	card, err := h.cardRepo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "failed to get updated credit card", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(card)
}

func (h *Handler) DeleteCreditCard(w http.ResponseWriter, r *http.Request) {
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

	if err := h.cardRepo.Delete(r.Context(), id); err != nil {
		http.Error(w, "failed to delete credit card", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Debt Handlers

func (h *Handler) CreateDebt(w http.ResponseWriter, r *http.Request) {
	var req CreateDebtRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	firstPaymentDate, err := time.Parse("2006-01-02", req.FirstPaymentDate)
	if err != nil {
		http.Error(w, "invalid first_payment_date format (use YYYY-MM-DD)", http.StatusBadRequest)
		return
	}

	debt := &Debt{
		UserID:           req.UserID,
		CreditCardID:     req.CreditCardID,
		Title:            req.Title,
		Description:      req.Description,
		TotalAmount:      req.TotalAmount,
		Currency:         req.Currency,
		InstallmentCount: req.InstallmentCount,
		InstallmentType:  req.InstallmentType,
		FirstPaymentDate: firstPaymentDate,
		Notes:            req.Notes,
	}

	if err := h.debtRepo.Create(r.Context(), debt); err != nil {
		http.Error(w, "failed to create debt", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(debt)
}

func (h *Handler) GetDebtsByUserID(w http.ResponseWriter, r *http.Request) {
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

	debts, err := h.debtRepo.GetByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get debts", http.StatusInternalServerError)
		return
	}

	if debts == nil {
		debts = []Debt{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(debts)
}

func (h *Handler) GetDebtSummary(w http.ResponseWriter, r *http.Request) {
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

	summary, err := h.debtRepo.GetSummary(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get debt summary", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

func (h *Handler) UpdateDebt(w http.ResponseWriter, r *http.Request) {
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

	var req UpdateDebtRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.debtRepo.Update(r.Context(), id, &req); err != nil {
		http.Error(w, "failed to update debt", http.StatusInternalServerError)
		return
	}

	debt, err := h.debtRepo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "failed to get updated debt", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(debt)
}

func (h *Handler) DeleteDebt(w http.ResponseWriter, r *http.Request) {
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

	if err := h.debtRepo.Delete(r.Context(), id); err != nil {
		http.Error(w, "failed to delete debt", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) PayInstallment(w http.ResponseWriter, r *http.Request) {
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

	if err := h.debtRepo.PayInstallment(r.Context(), id); err != nil {
		http.Error(w, "failed to pay installment", http.StatusInternalServerError)
		return
	}

	debt, err := h.debtRepo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "failed to get updated debt", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(debt)
}
