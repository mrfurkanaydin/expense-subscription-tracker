package investments

import (
	"context"

	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
)

type PostgresRepository struct{}

func NewPostgresRepository() *PostgresRepository {
	return &PostgresRepository{}
}

func (r *PostgresRepository) Create(ctx context.Context, inv *Investment) (*Investment, error) {
	query := `
		INSERT INTO investments (user_id, type, symbol, name, quantity, purchase_price, purchase_currency, purchase_date, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, user_id, type, symbol, name, quantity, purchase_price, purchase_currency, purchase_date, notes, created_at, updated_at
	`

	var created Investment
	err := db.Pool.QueryRow(ctx, query,
		inv.UserID,
		inv.Type,
		inv.Symbol,
		inv.Name,
		inv.Quantity,
		inv.PurchasePrice,
		inv.PurchaseCurrency,
		inv.PurchaseDate,
		inv.Notes,
	).Scan(
		&created.ID,
		&created.UserID,
		&created.Type,
		&created.Symbol,
		&created.Name,
		&created.Quantity,
		&created.PurchasePrice,
		&created.PurchaseCurrency,
		&created.PurchaseDate,
		&created.Notes,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &created, nil
}

func (r *PostgresRepository) GetByUserID(ctx context.Context, userID string) ([]*Investment, error) {
	query := `
		SELECT id, user_id, type, symbol, name, quantity, purchase_price, purchase_currency, purchase_date, notes, created_at, updated_at
		FROM investments
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := db.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var investments []*Investment
	for rows.Next() {
		var inv Investment
		err := rows.Scan(
			&inv.ID,
			&inv.UserID,
			&inv.Type,
			&inv.Symbol,
			&inv.Name,
			&inv.Quantity,
			&inv.PurchasePrice,
			&inv.PurchaseCurrency,
			&inv.PurchaseDate,
			&inv.Notes,
			&inv.CreatedAt,
			&inv.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		investments = append(investments, &inv)
	}

	return investments, nil
}

func (r *PostgresRepository) GetByID(ctx context.Context, id string) (*Investment, error) {
	query := `
		SELECT id, user_id, type, symbol, name, quantity, purchase_price, purchase_currency, purchase_date, notes, created_at, updated_at
		FROM investments
		WHERE id = $1
	`

	var inv Investment
	err := db.Pool.QueryRow(ctx, query, id).Scan(
		&inv.ID,
		&inv.UserID,
		&inv.Type,
		&inv.Symbol,
		&inv.Name,
		&inv.Quantity,
		&inv.PurchasePrice,
		&inv.PurchaseCurrency,
		&inv.PurchaseDate,
		&inv.Notes,
		&inv.CreatedAt,
		&inv.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &inv, nil
}

func (r *PostgresRepository) Update(ctx context.Context, id string, inv *Investment) (*Investment, error) {
	query := `
		UPDATE investments
		SET quantity = $2, purchase_price = $3, purchase_currency = $4, purchase_date = $5, notes = $6, updated_at = NOW()
		WHERE id = $1
		RETURNING id, user_id, type, symbol, name, quantity, purchase_price, purchase_currency, purchase_date, notes, created_at, updated_at
	`

	var updated Investment
	err := db.Pool.QueryRow(ctx, query,
		id,
		inv.Quantity,
		inv.PurchasePrice,
		inv.PurchaseCurrency,
		inv.PurchaseDate,
		inv.Notes,
	).Scan(
		&updated.ID,
		&updated.UserID,
		&updated.Type,
		&updated.Symbol,
		&updated.Name,
		&updated.Quantity,
		&updated.PurchasePrice,
		&updated.PurchaseCurrency,
		&updated.PurchaseDate,
		&updated.Notes,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &updated, nil
}

func (r *PostgresRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM investments WHERE id = $1`
	_, err := db.Pool.Exec(ctx, query, id)
	return err
}

func (r *PostgresRepository) GetByUserIDAndType(ctx context.Context, userID string, invType string) ([]*Investment, error) {
	query := `
		SELECT id, user_id, type, symbol, name, quantity, purchase_price, purchase_currency, purchase_date, notes, created_at, updated_at
		FROM investments
		WHERE user_id = $1 AND type = $2
		ORDER BY created_at DESC
	`

	rows, err := db.Pool.Query(ctx, query, userID, invType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var investments []*Investment
	for rows.Next() {
		var inv Investment
		err := rows.Scan(
			&inv.ID,
			&inv.UserID,
			&inv.Type,
			&inv.Symbol,
			&inv.Name,
			&inv.Quantity,
			&inv.PurchasePrice,
			&inv.PurchaseCurrency,
			&inv.PurchaseDate,
			&inv.Notes,
			&inv.CreatedAt,
			&inv.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		investments = append(investments, &inv)
	}

	return investments, nil
}
