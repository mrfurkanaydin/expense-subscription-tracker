package debts

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mrfurkanaydin/expense-subscription-tracker/backend/internal/db"
)

type PostgresCreditCardRepository struct{}

func NewPostgresCreditCardRepository() *PostgresCreditCardRepository {
	return &PostgresCreditCardRepository{}
}

func (r *PostgresCreditCardRepository) Create(ctx context.Context, card *CreditCard) error {
	card.ID = uuid.New()
	card.CreatedAt = time.Now()
	if card.Currency == "" {
		card.Currency = "TRY"
	}
	if card.Color == "" {
		card.Color = "#6366F1"
	}
	card.Active = true

	query := `
		INSERT INTO credit_cards (id, user_id, name, bank_name, last_four_digits, statement_day, due_day, credit_limit, currency, color, active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := db.Pool.Exec(ctx, query,
		card.ID, card.UserID, card.Name, card.BankName, card.LastFourDigits,
		card.StatementDay, card.DueDay, card.CreditLimit, card.Currency, card.Color,
		card.Active, card.CreatedAt,
	)
	return err
}

func (r *PostgresCreditCardRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]CreditCard, error) {
	query := `
		SELECT cc.id, cc.user_id, cc.name, cc.bank_name, cc.last_four_digits, 
		       cc.statement_day, cc.due_day, cc.credit_limit, cc.currency, cc.color, 
		       cc.active, cc.created_at,
		       COALESCE(SUM(CASE WHEN d.status = 'active' THEN d.remaining_amount ELSE 0 END), 0) as total_debt
		FROM credit_cards cc
		LEFT JOIN debts d ON cc.id = d.credit_card_id
		WHERE cc.user_id = $1
		GROUP BY cc.id
		ORDER BY cc.created_at DESC
	`
	rows, err := db.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []CreditCard
	for rows.Next() {
		var card CreditCard
		err := rows.Scan(
			&card.ID, &card.UserID, &card.Name, &card.BankName, &card.LastFourDigits,
			&card.StatementDay, &card.DueDay, &card.CreditLimit, &card.Currency, &card.Color,
			&card.Active, &card.CreatedAt, &card.TotalDebt,
		)
		if err != nil {
			return nil, err
		}
		cards = append(cards, card)
	}
	return cards, nil
}

func (r *PostgresCreditCardRepository) GetByID(ctx context.Context, id uuid.UUID) (*CreditCard, error) {
	query := `
		SELECT id, user_id, name, bank_name, last_four_digits, statement_day, due_day, 
		       credit_limit, currency, color, active, created_at
		FROM credit_cards WHERE id = $1
	`
	var card CreditCard
	err := db.Pool.QueryRow(ctx, query, id).Scan(
		&card.ID, &card.UserID, &card.Name, &card.BankName, &card.LastFourDigits,
		&card.StatementDay, &card.DueDay, &card.CreditLimit, &card.Currency, &card.Color,
		&card.Active, &card.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &card, nil
}

func (r *PostgresCreditCardRepository) Update(ctx context.Context, id uuid.UUID, req *UpdateCreditCardRequest) error {
	query := `
		UPDATE credit_cards SET
			name = COALESCE($2, name),
			bank_name = COALESCE($3, bank_name),
			last_four_digits = COALESCE($4, last_four_digits),
			statement_day = COALESCE($5, statement_day),
			due_day = COALESCE($6, due_day),
			credit_limit = COALESCE($7, credit_limit),
			currency = COALESCE($8, currency),
			color = COALESCE($9, color),
			active = COALESCE($10, active)
		WHERE id = $1
	`
	_, err := db.Pool.Exec(ctx, query, id,
		req.Name, req.BankName, req.LastFourDigits, req.StatementDay,
		req.DueDay, req.CreditLimit, req.Currency, req.Color, req.Active,
	)
	return err
}

func (r *PostgresCreditCardRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := db.Pool.Exec(ctx, "DELETE FROM credit_cards WHERE id = $1", id)
	return err
}

// PostgresDebtRepository implementation
type PostgresDebtRepository struct{}

func NewPostgresDebtRepository() *PostgresDebtRepository {
	return &PostgresDebtRepository{}
}

func (r *PostgresDebtRepository) Create(ctx context.Context, debt *Debt) error {
	debt.ID = uuid.New()
	debt.CreatedAt = time.Now()
	if debt.Currency == "" {
		debt.Currency = "TRY"
	}
	if debt.InstallmentType == "" {
		debt.InstallmentType = "fixed"
	}
	if debt.InstallmentCount < 1 {
		debt.InstallmentCount = 1
	}
	debt.PaidInstallments = 0
	debt.RemainingAmount = debt.TotalAmount
	debt.Status = "active"

	// Calculate installment amount
	installmentAmount := debt.TotalAmount / float64(debt.InstallmentCount)
	debt.InstallmentAmount = &installmentAmount

	// Set next payment date to first payment date
	debt.NextPaymentDate = debt.FirstPaymentDate

	query := `
		INSERT INTO debts (id, user_id, credit_card_id, title, description, total_amount, remaining_amount, 
		                   currency, installment_count, paid_installments, installment_amount, installment_type,
		                   first_payment_date, next_payment_date, notes, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`
	_, err := db.Pool.Exec(ctx, query,
		debt.ID, debt.UserID, debt.CreditCardID, debt.Title, debt.Description,
		debt.TotalAmount, debt.RemainingAmount, debt.Currency, debt.InstallmentCount,
		debt.PaidInstallments, debt.InstallmentAmount, debt.InstallmentType,
		debt.FirstPaymentDate, debt.NextPaymentDate, debt.Notes, debt.Status, debt.CreatedAt,
	)
	return err
}

func (r *PostgresDebtRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]Debt, error) {
	query := `
		SELECT d.id, d.user_id, d.credit_card_id, cc.name as credit_card_name,
		       d.title, d.description, d.total_amount, d.remaining_amount, d.currency,
		       d.installment_count, d.paid_installments, d.installment_amount, d.installment_type,
		       d.first_payment_date, d.next_payment_date, d.notes, d.status, d.created_at
		FROM debts d
		LEFT JOIN credit_cards cc ON d.credit_card_id = cc.id
		WHERE d.user_id = $1
		ORDER BY d.next_payment_date ASC
	`
	rows, err := db.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var debts []Debt
	for rows.Next() {
		var debt Debt
		err := rows.Scan(
			&debt.ID, &debt.UserID, &debt.CreditCardID, &debt.CreditCardName,
			&debt.Title, &debt.Description, &debt.TotalAmount, &debt.RemainingAmount, &debt.Currency,
			&debt.InstallmentCount, &debt.PaidInstallments, &debt.InstallmentAmount, &debt.InstallmentType,
			&debt.FirstPaymentDate, &debt.NextPaymentDate, &debt.Notes, &debt.Status, &debt.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		debts = append(debts, debt)
	}
	return debts, nil
}

func (r *PostgresDebtRepository) GetByID(ctx context.Context, id uuid.UUID) (*Debt, error) {
	query := `
		SELECT d.id, d.user_id, d.credit_card_id, cc.name as credit_card_name,
		       d.title, d.description, d.total_amount, d.remaining_amount, d.currency,
		       d.installment_count, d.paid_installments, d.installment_amount, d.installment_type,
		       d.first_payment_date, d.next_payment_date, d.notes, d.status, d.created_at
		FROM debts d
		LEFT JOIN credit_cards cc ON d.credit_card_id = cc.id
		WHERE d.id = $1
	`
	var debt Debt
	err := db.Pool.QueryRow(ctx, query, id).Scan(
		&debt.ID, &debt.UserID, &debt.CreditCardID, &debt.CreditCardName,
		&debt.Title, &debt.Description, &debt.TotalAmount, &debt.RemainingAmount, &debt.Currency,
		&debt.InstallmentCount, &debt.PaidInstallments, &debt.InstallmentAmount, &debt.InstallmentType,
		&debt.FirstPaymentDate, &debt.NextPaymentDate, &debt.Notes, &debt.Status, &debt.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &debt, nil
}

func (r *PostgresDebtRepository) GetByCreditCardID(ctx context.Context, cardID uuid.UUID) ([]Debt, error) {
	query := `
		SELECT id, user_id, credit_card_id, title, description, total_amount, remaining_amount, currency,
		       installment_count, paid_installments, installment_amount, installment_type,
		       first_payment_date, next_payment_date, notes, status, created_at
		FROM debts WHERE credit_card_id = $1
		ORDER BY next_payment_date ASC
	`
	rows, err := db.Pool.Query(ctx, query, cardID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var debts []Debt
	for rows.Next() {
		var debt Debt
		err := rows.Scan(
			&debt.ID, &debt.UserID, &debt.CreditCardID, &debt.Title, &debt.Description,
			&debt.TotalAmount, &debt.RemainingAmount, &debt.Currency,
			&debt.InstallmentCount, &debt.PaidInstallments, &debt.InstallmentAmount, &debt.InstallmentType,
			&debt.FirstPaymentDate, &debt.NextPaymentDate, &debt.Notes, &debt.Status, &debt.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		debts = append(debts, debt)
	}
	return debts, nil
}

func (r *PostgresDebtRepository) Update(ctx context.Context, id uuid.UUID, req *UpdateDebtRequest) error {
	query := `
		UPDATE debts SET
			credit_card_id = COALESCE($2, credit_card_id),
			title = COALESCE($3, title),
			description = COALESCE($4, description),
			installment_type = COALESCE($5, installment_type),
			notes = COALESCE($6, notes),
			status = COALESCE($7, status)
		WHERE id = $1
	`
	_, err := db.Pool.Exec(ctx, query, id,
		req.CreditCardID, req.Title, req.Description, req.InstallmentType, req.Notes, req.Status,
	)
	return err
}

func (r *PostgresDebtRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := db.Pool.Exec(ctx, "DELETE FROM debts WHERE id = $1", id)
	return err
}

func (r *PostgresDebtRepository) PayInstallment(ctx context.Context, id uuid.UUID) error {
	// Get current debt
	debt, err := r.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if debt.Status != "active" {
		return nil // Already paid or cancelled
	}

	newPaidInstallments := debt.PaidInstallments + 1
	var newRemainingAmount float64
	var newStatus string
	var newNextPaymentDate time.Time

	if debt.InstallmentAmount != nil {
		newRemainingAmount = debt.RemainingAmount - *debt.InstallmentAmount
		if newRemainingAmount < 0 {
			newRemainingAmount = 0
		}
	}

	if newPaidInstallments >= debt.InstallmentCount {
		newStatus = "paid"
		newRemainingAmount = 0
		newNextPaymentDate = debt.NextPaymentDate // Keep the same
	} else {
		newStatus = "active"
		// Add one month to next payment date
		newNextPaymentDate = debt.NextPaymentDate.AddDate(0, 1, 0)
	}

	query := `
		UPDATE debts SET
			paid_installments = $2,
			remaining_amount = $3,
			status = $4,
			next_payment_date = $5
		WHERE id = $1
	`
	_, err = db.Pool.Exec(ctx, query, id, newPaidInstallments, newRemainingAmount, newStatus, newNextPaymentDate)
	return err
}

func (r *PostgresDebtRepository) GetSummary(ctx context.Context, userID uuid.UUID) (*DebtSummary, error) {
	query := `
		SELECT 
			COALESCE(SUM(remaining_amount), 0) as total_debt,
			COALESCE(SUM(CASE WHEN status = 'active' THEN installment_amount ELSE 0 END), 0) as total_monthly,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
			COALESCE(SUM(installment_count), 0) as total_installments,
			COALESCE(SUM(paid_installments), 0) as paid_installments
		FROM debts WHERE user_id = $1
	`
	var summary DebtSummary
	err := db.Pool.QueryRow(ctx, query, userID).Scan(
		&summary.TotalDebt, &summary.TotalMonthlyPayment, &summary.ActiveDebtsCount,
		&summary.TotalInstallments, &summary.PaidInstallments,
	)
	if err != nil {
		return nil, err
	}
	return &summary, nil
}
