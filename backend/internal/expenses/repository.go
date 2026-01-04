package expenses

import (
	"context"
)

type Repository interface {
	Create(ctx context.Context, e *Expense) (*Expense, error)
	GetByUserID(ctx context.Context, userID string) ([]*Expense, error)
	Update(ctx context.Context, id string, e *Expense) (*Expense, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (*Expense, error)
}
