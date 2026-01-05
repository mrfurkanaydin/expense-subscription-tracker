package expenses

import (
	"context"
	"log"

	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
)

type PostgresRepository struct{}

func NewPostgresRepository() Repository {
	return &PostgresRepository{}
}

func (r *PostgresRepository) Create(ctx context.Context, e *Expense) (*Expense, error) {
	row := db.Pool.QueryRow(ctx,
		`INSERT INTO expenses (user_id, title, amount, currency, category, credit_card_id, payment_method)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)
		 RETURNING id, user_id, title, amount, currency, category, credit_card_id, payment_method, created_at`,
		e.UserID, e.Title, e.Amount, e.Currency, e.Category, e.CreditCardID, e.PaymentMethod,
	)

	var exp Expense
	err := row.Scan(&exp.ID, &exp.UserID, &exp.Title, &exp.Amount, &exp.Currency, &exp.Category, &exp.CreditCardID, &exp.PaymentMethod, &exp.CreatedAt)
	if err != nil {
		log.Println("expense insert error:", err)
		return nil, err
	}

	return &exp, nil
}

func (r *PostgresRepository) GetByUserID(ctx context.Context, userID string) ([]*Expense, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT e.id, e.user_id, e.title, e.amount, e.currency, e.category, e.credit_card_id, c.name, e.payment_method, e.created_at
		 FROM expenses e
		 LEFT JOIN credit_cards c ON e.credit_card_id = c.id
		 WHERE e.user_id=$1
		 ORDER BY e.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var expenses []*Expense
	for rows.Next() {
		var e Expense
		if err := rows.Scan(&e.ID, &e.UserID, &e.Title, &e.Amount, &e.Currency, &e.Category, &e.CreditCardID, &e.CreditCardName, &e.PaymentMethod, &e.CreatedAt); err != nil {
			return nil, err
		}
		expenses = append(expenses, &e)
	}

	return expenses, nil
}

func (r *PostgresRepository) Update(ctx context.Context, id string, e *Expense) (*Expense, error) {
	row := db.Pool.QueryRow(ctx,
		`UPDATE expenses 
		 SET title=$1, amount=$2, currency=$3, category=$4, credit_card_id=$5, payment_method=$6
		 WHERE id=$7
		 RETURNING id, user_id, title, amount, currency, category, credit_card_id, payment_method, created_at`,
		e.Title, e.Amount, e.Currency, e.Category, e.CreditCardID, e.PaymentMethod, id,
	)

	var exp Expense
	err := row.Scan(&exp.ID, &exp.UserID, &exp.Title, &exp.Amount, &exp.Currency, &exp.Category, &exp.CreditCardID, &exp.PaymentMethod, &exp.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &exp, nil
}

func (r *PostgresRepository) Delete(ctx context.Context, id string) error {
	_, err := db.Pool.Exec(ctx, "DELETE FROM expenses WHERE id=$1", id)
	return err
}

func (r *PostgresRepository) GetByID(ctx context.Context, id string) (*Expense, error) {
	row := db.Pool.QueryRow(ctx,
		`SELECT e.id, e.user_id, e.title, e.amount, e.currency, e.category, e.credit_card_id, c.name, e.payment_method, e.created_at
		 FROM expenses e
		 LEFT JOIN credit_cards c ON e.credit_card_id = c.id
		 WHERE e.id=$1`, id)

	var exp Expense
	err := row.Scan(&exp.ID, &exp.UserID, &exp.Title, &exp.Amount, &exp.Currency, &exp.Category, &exp.CreditCardID, &exp.CreditCardName, &exp.PaymentMethod, &exp.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &exp, nil
}
