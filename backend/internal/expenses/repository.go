package expenses

import (
	"context"
)

type Repository interface {
	Create(ctx context.Context, e *Expense) (*Expense, error)
	GetByUserID(ctx context.Context, userID string) ([]*Expense, error)
}
