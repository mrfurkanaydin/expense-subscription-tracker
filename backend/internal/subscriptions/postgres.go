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
		`INSERT INTO subscriptions (user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active, credit_card_id)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		 RETURNING id, user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active, credit_card_id, created_at`,
		s.UserID, s.Title, s.Amount, s.Currency, s.BillingPeriod, s.NextBillingAt, s.StartDate, s.EndDate, s.Active, s.CreditCardID,
	)

	var sub Subscription
	err := row.Scan(&sub.ID, &sub.UserID, &sub.Title, &sub.Amount, &sub.Currency, &sub.BillingPeriod, &sub.NextBillingAt, &sub.StartDate, &sub.EndDate, &sub.Active, &sub.CreditCardID, &sub.CreatedAt)
	if err != nil {
		log.Println("subscription insert error:", err)
		return nil, err
	}

	return &sub, nil
}

func (r *PostgresRepository) GetByUserID(ctx context.Context, userID string) ([]*Subscription, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT s.id, s.user_id, s.title, s.amount, s.currency, s.billing_period, s.next_billing_at, s.start_date, s.end_date, s.active, s.credit_card_id, c.name, s.created_at
		 FROM subscriptions s
		 LEFT JOIN credit_cards c ON s.credit_card_id = c.id
		 WHERE s.user_id=$1
		 ORDER BY s.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []*Subscription
	for rows.Next() {
		var s Subscription
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.Amount, &s.Currency, &s.BillingPeriod, &s.NextBillingAt, &s.StartDate, &s.EndDate, &s.Active, &s.CreditCardID, &s.CreditCardName, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, &s)
	}

	return subs, nil
}

func (r *PostgresRepository) GetUpcoming(ctx context.Context, within time.Duration) ([]*Subscription, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT s.id, s.user_id, s.title, s.amount, s.currency, s.billing_period, s.next_billing_at, s.start_date, s.end_date, s.active, s.credit_card_id, c.name, s.created_at
		 FROM subscriptions s
		 LEFT JOIN credit_cards c ON s.credit_card_id = c.id
		 WHERE s.active = TRUE AND s.next_billing_at <= NOW() + $1::interval
		 ORDER BY s.next_billing_at ASC`,
		within.String(),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []*Subscription
	for rows.Next() {
		var s Subscription
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.Amount, &s.Currency, &s.BillingPeriod, &s.NextBillingAt, &s.StartDate, &s.EndDate, &s.Active, &s.CreditCardID, &s.CreditCardName, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, &s)
	}

	return subs, nil
}

func (r *PostgresRepository) Update(ctx context.Context, id string, s *Subscription) (*Subscription, error) {
	row := db.Pool.QueryRow(ctx,
		`UPDATE subscriptions 
		 SET title=$1, amount=$2, currency=$3, billing_period=$4, next_billing_at=$5, start_date=$6, end_date=$7, active=$8, credit_card_id=$9
		 WHERE id=$10
		 RETURNING id, user_id, title, amount, currency, billing_period, next_billing_at, start_date, end_date, active, credit_card_id, created_at`,
		s.Title, s.Amount, s.Currency, s.BillingPeriod, s.NextBillingAt, s.StartDate, s.EndDate, s.Active, s.CreditCardID, id,
	)

	var sub Subscription
	err := row.Scan(&sub.ID, &sub.UserID, &sub.Title, &sub.Amount, &sub.Currency, &sub.BillingPeriod, &sub.NextBillingAt, &sub.StartDate, &sub.EndDate, &sub.Active, &sub.CreditCardID, &sub.CreatedAt)
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
		`SELECT s.id, s.user_id, s.title, s.amount, s.currency, s.billing_period, s.next_billing_at, s.start_date, s.end_date, s.active, s.credit_card_id, c.name, s.created_at
		 FROM subscriptions s
		 LEFT JOIN credit_cards c ON s.credit_card_id = c.id
		 WHERE s.id=$1`, id)

	var sub Subscription
	err := row.Scan(&sub.ID, &sub.UserID, &sub.Title, &sub.Amount, &sub.Currency, &sub.BillingPeriod, &sub.NextBillingAt, &sub.StartDate, &sub.EndDate, &sub.Active, &sub.CreditCardID, &sub.CreditCardName, &sub.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &sub, nil
}
