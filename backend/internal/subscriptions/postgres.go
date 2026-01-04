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
		`INSERT INTO subscriptions (user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		 RETURNING id, user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active, created_at`,
		s.UserID, s.Title, s.Amount, s.Currency, s.BillingPeriod, s.NextBillingAt, s.StartDate, s.EndDate, s.Active,
	)

	var sub Subscription
	err := row.Scan(&sub.ID, &sub.UserID, &sub.Title, &sub.Amount, &sub.Currency, &sub.BillingPeriod, &sub.NextBillingAt, &sub.StartDate, &sub.EndDate, &sub.Active, &sub.CreatedAt)
	if err != nil {
		log.Println("subscription insert error:", err)
		return nil, err
	}

	return &sub, nil
}

func (r *PostgresRepository) GetByUserID(ctx context.Context, userID string) ([]*Subscription, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active, created_at
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
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.Amount, &s.Currency, &s.BillingPeriod, &s.NextBillingAt, &s.StartDate, &s.EndDate, &s.Active, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, &s)
	}

	return subs, nil
}

func (r *PostgresRepository) GetUpcoming(ctx context.Context, within time.Duration) ([]*Subscription, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active, created_at
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
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.Amount, &s.Currency, &s.BillingPeriod, &s.NextBillingAt, &s.StartDate, &s.EndDate, &s.Active, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, &s)
	}

	return subs, nil
}

func (r *PostgresRepository) Update(ctx context.Context, id string, s *Subscription) (*Subscription, error) {
	row := db.Pool.QueryRow(ctx,
		`UPDATE subscriptions 
		 SET title=$1, amount=$2, currency=$3, billing_period=$4, next_billing_at=$5, start_date=$6, end_date=$7, active=$8
		 WHERE id=$9
		 RETURNING id, user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active, created_at`,
		s.Title, s.Amount, s.Currency, s.BillingPeriod, s.NextBillingAt, s.StartDate, s.EndDate, s.Active, id,
	)

	var sub Subscription
	err := row.Scan(&sub.ID, &sub.UserID, &sub.Title, &sub.Amount, &sub.Currency, &sub.BillingPeriod, &sub.NextBillingAt, &sub.StartDate, &sub.EndDate, &sub.Active, &sub.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &sub, nil
}

func (r *PostgresRepository) Delete(ctx context.Context, id string) error {
	_, err := db.Pool.Exec(ctx, "DELETE FROM subscriptions WHERE id=$1", id)
	return err
}

func (r *PostgresRepository) GetByID(ctx context.Context, id string) (*Subscription, error) {
	row := db.Pool.QueryRow(ctx,
		`SELECT id, user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active, created_at
		 FROM subscriptions
		 WHERE id=$1`, id)

	var sub Subscription
	err := row.Scan(&sub.ID, &sub.UserID, &sub.Title, &sub.Amount, &sub.Currency, &sub.BillingPeriod, &sub.NextBillingAt, &sub.StartDate, &sub.EndDate, &sub.Active, &sub.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &sub, nil
}
