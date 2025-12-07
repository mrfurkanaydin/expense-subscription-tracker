package subscriptions

import (
	"context"
	"time"
)

type Repository interface {
	Create(ctx context.Context, s *Subscription) (*Subscription, error)
	GetByUserID(ctx context.Context, userID string) ([]*Subscription, error)
	GetUpcoming(ctx context.Context, within time.Duration) ([]*Subscription, error)
}
