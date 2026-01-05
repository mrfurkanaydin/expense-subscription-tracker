package debts

import (
	"context"

	"github.com/google/uuid"
)

// CreditCardRepository defines the interface for credit card operations
type CreditCardRepository interface {
	Create(ctx context.Context, card *CreditCard) error
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]CreditCard, error)
	GetByID(ctx context.Context, id uuid.UUID) (*CreditCard, error)
	Update(ctx context.Context, id uuid.UUID, req *UpdateCreditCardRequest) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// DebtRepository defines the interface for debt operations
type DebtRepository interface {
	Create(ctx context.Context, debt *Debt) error
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]Debt, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Debt, error)
	GetByCreditCardID(ctx context.Context, cardID uuid.UUID) ([]Debt, error)
	Update(ctx context.Context, id uuid.UUID, req *UpdateDebtRequest) error
	Delete(ctx context.Context, id uuid.UUID) error
	PayInstallment(ctx context.Context, id uuid.UUID) error
	GetSummary(ctx context.Context, userID uuid.UUID) (*DebtSummary, error)
}
