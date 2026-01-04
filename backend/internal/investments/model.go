package investments

import (
	"time"

	"github.com/google/uuid"
)

// InvestmentType represents the type of investment
type InvestmentType string

const (
	TypeMetal     InvestmentType = "metal"
	TypeStockUS   InvestmentType = "stock_us"
	TypeStockBIST InvestmentType = "stock_bist"
	TypeFund      InvestmentType = "fund"
	TypeBES       InvestmentType = "bes"
)

// Investment represents an investment record
type Investment struct {
	ID               uuid.UUID      `json:"id"`
	UserID           uuid.UUID      `json:"user_id"`
	Type             InvestmentType `json:"type"`
	Symbol           string         `json:"symbol"`
	Name             string         `json:"name"`
	Quantity         float64        `json:"quantity"`
	PurchasePrice    float64        `json:"purchase_price"`
	PurchaseCurrency string         `json:"purchase_currency"`
	PurchaseDate     time.Time      `json:"purchase_date"`
	Notes            string         `json:"notes,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
}

// CreateInvestmentRequest is the request body for creating an investment
type CreateInvestmentRequest struct {
	UserID           string  `json:"user_id"`
	Type             string  `json:"type"`
	Symbol           string  `json:"symbol"`
	Name             string  `json:"name"`
	Quantity         float64 `json:"quantity"`
	PurchasePrice    float64 `json:"purchase_price"`
	PurchaseCurrency string  `json:"purchase_currency"`
	PurchaseDate     string  `json:"purchase_date"` // ISO timestamp
	Notes            string  `json:"notes,omitempty"`
}

// UpdateInvestmentRequest is the request body for updating an investment
type UpdateInvestmentRequest struct {
	Quantity         *float64 `json:"quantity,omitempty"`
	PurchasePrice    *float64 `json:"purchase_price,omitempty"`
	PurchaseCurrency *string  `json:"purchase_currency,omitempty"`
	PurchaseDate     *string  `json:"purchase_date,omitempty"`
	Notes            *string  `json:"notes,omitempty"`
}

// IsValidType checks if the investment type is valid
func IsValidType(t string) bool {
	switch InvestmentType(t) {
	case TypeMetal, TypeStockUS, TypeStockBIST, TypeFund, TypeBES:
		return true
	}
	return false
}
