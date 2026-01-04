package subscriptions

import (
	"context"
	"time"
)

type Repository interface {
	Create(ctx context.Context, s *Subscription) (*Subscription, error)
	GetByUserID(ctx context.Context, userID string) ([]*Subscription, error)
	GetUpcoming(ctx context.Context, within time.Duration) ([]*Subscription, error)
	Update(ctx context.Context, id string, s *Subscription) (*Subscription, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (*Subscription, error)
}
