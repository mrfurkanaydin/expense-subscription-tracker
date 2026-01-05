-- Drop indexes
DROP INDEX IF EXISTS idx_debts_next_payment_date;
DROP INDEX IF EXISTS idx_debts_status;
DROP INDEX IF EXISTS idx_debts_credit_card_id;
DROP INDEX IF EXISTS idx_debts_user_id;
DROP INDEX IF EXISTS idx_credit_cards_user_id;

-- Drop tables
DROP TABLE IF EXISTS debts;
DROP TABLE IF EXISTS credit_cards;
