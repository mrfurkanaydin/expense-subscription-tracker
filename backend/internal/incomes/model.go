package incomes

import (
	"time"

	"github.com/google/uuid"
)

// Income represents a user's income entry
type Income struct {
	ID              uuid.UUID `json:"id"`
	UserID          uuid.UUID `json:"user_id"`
	Title           string    `json:"title"`
	Amount          float64   `json:"amount"`
	Currency        string    `json:"currency"`
	Category        string    `json:"category"`
	IsRecurring     bool      `json:"is_recurring"`
	RecurringPeriod *string   `json:"recurring_period,omitempty"`
	IncomeDate      time.Time `json:"income_date"`
	Notes           *string   `json:"notes,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

// CreateIncomeRequest for creating a new income
type CreateIncomeRequest struct {
	UserID          uuid.UUID `json:"user_id"`
	Title           string    `json:"title"`
	Amount          float64   `json:"amount"`
	Currency        string    `json:"currency"`
	Category        string    `json:"category"`
	IsRecurring     bool      `json:"is_recurring"`
	RecurringPeriod *string   `json:"recurring_period,omitempty"`
	IncomeDate      string    `json:"income_date"` // YYYY-MM-DD
	Notes           *string   `json:"notes,omitempty"`
}

// UpdateIncomeRequest for updating an income
type UpdateIncomeRequest struct {
	Title           *string  `json:"title,omitempty"`
	Amount          *float64 `json:"amount,omitempty"`
	Currency        *string  `json:"currency,omitempty"`
	Category        *string  `json:"category,omitempty"`
	IsRecurring     *bool    `json:"is_recurring,omitempty"`
	RecurringPeriod *string  `json:"recurring_period,omitempty"`
	IncomeDate      *string  `json:"income_date,omitempty"`
	Notes           *string  `json:"notes,omitempty"`
}

// IncomeSummary provides summary statistics
type IncomeSummary struct {
	TotalIncome       float64 `json:"total_income"`
	MonthlyRecurring  float64 `json:"monthly_recurring"`
	ThisMonthIncome   float64 `json:"this_month_income"`
	IncomeCount       int     `json:"income_count"`
	TopCategory       string  `json:"top_category"`
	TopCategoryAmount float64 `json:"top_category_amount"`
}

// Income categories
var IncomeCategories = []string{
	"Maaş",
	"Freelance",
	"Kira Geliri",
	"Yatırım Getirisi",
	"Satış Geliri",
	"Hediye/Transfer",
	"Diğer",
}
