package subscriptions

import (
	"context"
	"log"
	"time"

	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
)

type PostgresRepository struct{}

func NewPostgresRepository() Repository {
	return &PostgresRepository{}
}

func (r *PostgresRepository) Create(ctx context.Context, s *Subscription) (*Subscription, error) {
	row := db.Pool.QueryRow(ctx,
		`INSERT INTO subscriptions (user_id, title, amount, currency, billing_period, next_billing_at, active)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)
		 RETURNING id, user_id, title, amount, currency, billing_period, next_billing_at, active, created_at`,
		s.UserID, s.Title, s.Amount, s.Currency, s.BillingPeriod, s.NextBillingAt, s.Active,
	)

	var sub Subscription
	err := row.Scan(&sub.ID, &sub.UserID, &sub.Title, &sub.Amount, &sub.Currency, &sub.BillingPeriod, &sub.NextBillingAt, &sub.Active, &sub.CreatedAt)
	if err != nil {
		log.Println("subscription insert error:", err)
		return nil, err
	}

	return &sub, nil
}

func (r *PostgresRepository) GetByUserID(ctx context.Context, userID string) ([]*Subscription, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, user_id, title, amount, currency, billing_period, next_billing_at, active, created_at
		 FROM subscriptions
		 WHERE user_id=$1
		 ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []*Subscription
	for rows.Next() {
		var s Subscription
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.Amount, &s.Currency, &s.BillingPeriod, &s.NextBillingAt, &s.Active, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, &s)
	}

	return subs, nil
}

func (r *PostgresRepository) GetUpcoming(ctx context.Context, within time.Duration) ([]*Subscription, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, user_id, title, amount, currency, billing_period, next_billing_at, active, created_at
		 FROM subscriptions
		 WHERE active = TRUE AND next_billing_at <= NOW() + $1::interval
		 ORDER BY next_billing_at ASC`,
		within.String(),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []*Subscription
	for rows.Next() {
		var s Subscription
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.Amount, &s.Currency, &s.BillingPeriod, &s.NextBillingAt, &s.Active, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, &s)
	}

	return subs, nil
}
