package debts

import (
	"time"

	"github.com/google/uuid"
)

// CreditCard represents a user's credit card
type CreditCard struct {
	ID             uuid.UUID `json:"id"`
	UserID         uuid.UUID `json:"user_id"`
	Name           string    `json:"name"`
	BankName       *string   `json:"bank_name,omitempty"`
	LastFourDigits *string   `json:"last_four_digits,omitempty"`
	StatementDay   *int      `json:"statement_day,omitempty"`
	DueDay         *int      `json:"due_day,omitempty"`
	CreditLimit    *float64  `json:"credit_limit,omitempty"`
	Currency       string    `json:"currency"`
	Color          string    `json:"color"`
	Active         bool      `json:"active"`
	CreatedAt      time.Time `json:"created_at"`
	TotalDebt      float64   `json:"total_debt,omitempty"` // Calculated field
}

// Debt represents a debt or installment purchase
type Debt struct {
	ID                uuid.UUID  `json:"id"`
	UserID            uuid.UUID  `json:"user_id"`
	CreditCardID      *uuid.UUID `json:"credit_card_id,omitempty"`
	CreditCardName    *string    `json:"credit_card_name,omitempty"` // Joined field
	Title             string     `json:"title"`
	Description       *string    `json:"description,omitempty"`
	TotalAmount       float64    `json:"total_amount"`
	RemainingAmount   float64    `json:"remaining_amount"`
	Currency          string     `json:"currency"`
	InstallmentCount  int        `json:"installment_count"`
	PaidInstallments  int        `json:"paid_installments"`
	InstallmentAmount *float64   `json:"installment_amount,omitempty"`
	InstallmentType   string     `json:"installment_type"` // "fixed" or "decreasing"
	FirstPaymentDate  time.Time  `json:"first_payment_date"`
	NextPaymentDate   time.Time  `json:"next_payment_date"`
	Notes             *string    `json:"notes,omitempty"`
	Status            string     `json:"status"` // "active", "paid", "cancelled"
	CreatedAt         time.Time  `json:"created_at"`
}

// CreateCreditCardRequest for creating a new credit card
type CreateCreditCardRequest struct {
	UserID         uuid.UUID `json:"user_id"`
	Name           string    `json:"name"`
	BankName       *string   `json:"bank_name,omitempty"`
	LastFourDigits *string   `json:"last_four_digits,omitempty"`
	StatementDay   *int      `json:"statement_day,omitempty"`
	DueDay         *int      `json:"due_day,omitempty"`
	CreditLimit    *float64  `json:"credit_limit,omitempty"`
	Currency       string    `json:"currency"`
	Color          string    `json:"color"`
}

// UpdateCreditCardRequest for updating a credit card
type UpdateCreditCardRequest struct {
	Name           *string  `json:"name,omitempty"`
	BankName       *string  `json:"bank_name,omitempty"`
	LastFourDigits *string  `json:"last_four_digits,omitempty"`
	StatementDay   *int     `json:"statement_day,omitempty"`
	DueDay         *int     `json:"due_day,omitempty"`
	CreditLimit    *float64 `json:"credit_limit,omitempty"`
	Currency       *string  `json:"currency,omitempty"`
	Color          *string  `json:"color,omitempty"`
	Active         *bool    `json:"active,omitempty"`
}

// CreateDebtRequest for creating a new debt
type CreateDebtRequest struct {
	UserID           uuid.UUID  `json:"user_id"`
	CreditCardID     *uuid.UUID `json:"credit_card_id,omitempty"`
	Title            string     `json:"title"`
	Description      *string    `json:"description,omitempty"`
	TotalAmount      float64    `json:"total_amount"`
	Currency         string     `json:"currency"`
	InstallmentCount int        `json:"installment_count"`
	InstallmentType  string     `json:"installment_type"`
	FirstPaymentDate string     `json:"first_payment_date"` // YYYY-MM-DD format
	Notes            *string    `json:"notes,omitempty"`
}

// UpdateDebtRequest for updating a debt
type UpdateDebtRequest struct {
	CreditCardID    *uuid.UUID `json:"credit_card_id,omitempty"`
	Title           *string    `json:"title,omitempty"`
	Description     *string    `json:"description,omitempty"`
	InstallmentType *string    `json:"installment_type,omitempty"`
	Notes           *string    `json:"notes,omitempty"`
	Status          *string    `json:"status,omitempty"`
}

// DebtSummary provides summary statistics
type DebtSummary struct {
	TotalDebt           float64 `json:"total_debt"`
	TotalMonthlyPayment float64 `json:"total_monthly_payment"`
	ActiveDebtsCount    int     `json:"active_debts_count"`
	TotalInstallments   int     `json:"total_installments"`
	PaidInstallments    int     `json:"paid_installments"`
}
