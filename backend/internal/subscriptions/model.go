package subscriptions

import (
	"time"

	"github.com/google/uuid"
)

type Subscription struct {
	ID             uuid.UUID  `json:"id"`
	UserID         uuid.UUID  `json:"user_id"`
	Title          string     `json:"title"`
	Amount         float64    `json:"amount"`
	Currency       string     `json:"currency"`
	BillingPeriod  string     `json:"billing_period"` // monthly / yearly
	NextBillingAt  time.Time  `json:"next_billing_at"`
	StartDate      time.Time  `json:"start_date"`
	EndDate        *time.Time `json:"end_date,omitempty"`
	Active         bool       `json:"active"`
	CreditCardID   *uuid.UUID `json:"credit_card_id,omitempty"`
	CreditCardName *string    `json:"credit_card_name,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
}
