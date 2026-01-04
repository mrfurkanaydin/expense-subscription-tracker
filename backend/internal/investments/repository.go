package investments

import "context"

// Repository defines the interface for investment data operations
type Repository interface {
	Create(ctx context.Context, inv *Investment) (*Investment, error)
	GetByUserID(ctx context.Context, userID string) ([]*Investment, error)
	GetByID(ctx context.Context, id string) (*Investment, error)
	Update(ctx context.Context, id string, inv *Investment) (*Investment, error)
	Delete(ctx context.Context, id string) error
	GetByUserIDAndType(ctx context.Context, userID string, invType string) ([]*Investment, error)
}
