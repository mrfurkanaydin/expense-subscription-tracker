package incomes

import (
	"context"

	"github.com/google/uuid"
)

// IncomeRepository defines the interface for income operations
type IncomeRepository interface {
	Create(ctx context.Context, income *Income) error
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]Income, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Income, error)
	Update(ctx context.Context, id uuid.UUID, req *UpdateIncomeRequest) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetSummary(ctx context.Context, userID uuid.UUID) (*IncomeSummary, error)
}
