package users

import (
	"context"

	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
)

type PostgresRepository struct{}

func NewPostgresRepository() Repository {
	return &PostgresRepository{}
}

func (r *PostgresRepository) Create(ctx context.Context, email string) (*User, error) {
	row := db.Pool.QueryRow(
		ctx,
		"insert into users (email) values ($1) returning id, email, created_at",
		email,
	)

	var u User
	err := row.Scan(&u.ID, &u.Email, &u.CreatedAt)
	return &u, err
}

func (r *PostgresRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	row := db.Pool.QueryRow(
		ctx,
		"select id, email, created_at from users where email = $1",
		email,
	)

	var u User
	err := row.Scan(&u.ID, &u.Email, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
