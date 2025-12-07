package expenses

import (
	"time"

	"github.com/google/uuid"
)

type Expense struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Title     string    `json:"title"`
	Amount    float64   `json:"amount"`
	Currency  string    `json:"currency"`
	Category  string    `json:"category"`
	CreatedAt time.Time `json:"created_at"`
}
