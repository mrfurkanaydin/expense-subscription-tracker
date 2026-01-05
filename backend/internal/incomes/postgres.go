package incomes

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
)

type PostgresIncomeRepository struct{}

func NewPostgresRepository() *PostgresIncomeRepository {
	return &PostgresIncomeRepository{}
}

func (r *PostgresIncomeRepository) Create(ctx context.Context, income *Income) error {
	income.ID = uuid.New()
	income.CreatedAt = time.Now()
	if income.Currency == "" {
		income.Currency = "TRY"
	}

	query := `
		INSERT INTO incomes (id, user_id, title, amount, currency, category, is_recurring, recurring_period, income_date, notes, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := db.Pool.Exec(ctx, query,
		income.ID, income.UserID, income.Title, income.Amount, income.Currency,
		income.Category, income.IsRecurring, income.RecurringPeriod, income.IncomeDate,
		income.Notes, income.CreatedAt,
	)
	return err
}

func (r *PostgresIncomeRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]Income, error) {
	query := `
		SELECT id, user_id, title, amount, currency, category, is_recurring, recurring_period, income_date, notes, created_at
		FROM incomes
		WHERE user_id = $1
		ORDER BY income_date DESC
	`
	rows, err := db.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var incomes []Income
	for rows.Next() {
		var income Income
		err := rows.Scan(
			&income.ID, &income.UserID, &income.Title, &income.Amount, &income.Currency,
			&income.Category, &income.IsRecurring, &income.RecurringPeriod, &income.IncomeDate,
			&income.Notes, &income.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		incomes = append(incomes, income)
	}
	return incomes, nil
}

func (r *PostgresIncomeRepository) GetByID(ctx context.Context, id uuid.UUID) (*Income, error) {
	query := `
		SELECT id, user_id, title, amount, currency, category, is_recurring, recurring_period, income_date, notes, created_at
		FROM incomes WHERE id = $1
	`
	var income Income
	err := db.Pool.QueryRow(ctx, query, id).Scan(
		&income.ID, &income.UserID, &income.Title, &income.Amount, &income.Currency,
		&income.Category, &income.IsRecurring, &income.RecurringPeriod, &income.IncomeDate,
		&income.Notes, &income.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &income, nil
}

func (r *PostgresIncomeRepository) Update(ctx context.Context, id uuid.UUID, req *UpdateIncomeRequest) error {
	query := `
		UPDATE incomes SET
			title = COALESCE($2, title),
			amount = COALESCE($3, amount),
			currency = COALESCE($4, currency),
			category = COALESCE($5, category),
			is_recurring = COALESCE($6, is_recurring),
			recurring_period = COALESCE($7, recurring_period),
			notes = COALESCE($8, notes)
		WHERE id = $1
	`

	// Handle income_date separately if provided
	if req.IncomeDate != nil {
		incomeDate, err := time.Parse("2006-01-02", *req.IncomeDate)
		if err == nil {
			_, err = db.Pool.Exec(ctx, "UPDATE incomes SET income_date = $1 WHERE id = $2", incomeDate, id)
			if err != nil {
				return err
			}
		}
	}

	_, err := db.Pool.Exec(ctx, query, id,
		req.Title, req.Amount, req.Currency, req.Category,
		req.IsRecurring, req.RecurringPeriod, req.Notes,
	)
	return err
}

func (r *PostgresIncomeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := db.Pool.Exec(ctx, "DELETE FROM incomes WHERE id = $1", id)
	return err
}

func (r *PostgresIncomeRepository) GetSummary(ctx context.Context, userID uuid.UUID) (*IncomeSummary, error) {
	// Get total and count
	totalQuery := `
		SELECT COALESCE(SUM(amount), 0), COUNT(*)
		FROM incomes WHERE user_id = $1
	`
	var totalIncome float64
	var incomeCount int
	err := db.Pool.QueryRow(ctx, totalQuery, userID).Scan(&totalIncome, &incomeCount)
	if err != nil {
		return nil, err
	}

	// Get monthly recurring total
	recurringQuery := `
		SELECT COALESCE(SUM(amount), 0)
		FROM incomes 
		WHERE user_id = $1 AND is_recurring = true AND recurring_period = 'monthly'
	`
	var monthlyRecurring float64
	db.Pool.QueryRow(ctx, recurringQuery, userID).Scan(&monthlyRecurring)

	// Get this month's income
	thisMonthQuery := `
		SELECT COALESCE(SUM(amount), 0)
		FROM incomes 
		WHERE user_id = $1 
		AND EXTRACT(MONTH FROM income_date) = EXTRACT(MONTH FROM CURRENT_DATE)
		AND EXTRACT(YEAR FROM income_date) = EXTRACT(YEAR FROM CURRENT_DATE)
	`
	var thisMonthIncome float64
	db.Pool.QueryRow(ctx, thisMonthQuery, userID).Scan(&thisMonthIncome)

	// Get top category
	topCategoryQuery := `
		SELECT category, COALESCE(SUM(amount), 0) as total
		FROM incomes WHERE user_id = $1
		GROUP BY category
		ORDER BY total DESC
		LIMIT 1
	`
	var topCategory string
	var topCategoryAmount float64
	db.Pool.QueryRow(ctx, topCategoryQuery, userID).Scan(&topCategory, &topCategoryAmount)

	return &IncomeSummary{
		TotalIncome:       totalIncome,
		MonthlyRecurring:  monthlyRecurring,
		ThisMonthIncome:   thisMonthIncome,
		IncomeCount:       incomeCount,
		TopCategory:       topCategory,
		TopCategoryAmount: topCategoryAmount,
	}, nil
}
