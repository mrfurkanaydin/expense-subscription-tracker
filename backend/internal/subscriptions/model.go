package subscriptions

import (
	"time"

	"github.com/google/uuid"
)

type Subscription struct {
	ID            uuid.UUID `json:"id"`
	UserID        uuid.UUID `json:"user_id"`
	Title         string    `json:"title"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	BillingPeriod string    `json:"billing_period"` // monthly / yearly
	NextBillingAt time.Time `json:"next_billing_at"`
	Active        bool      `json:"active"`
	CreatedAt     time.Time `json:"created_at"`
}
