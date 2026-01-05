-- Drop indexes
DROP INDEX IF EXISTS idx_subscriptions_credit_card_id;
DROP INDEX IF EXISTS idx_expenses_credit_card_id;

-- Remove credit_card_id columns
ALTER TABLE subscriptions DROP COLUMN IF EXISTS credit_card_id;
ALTER TABLE expenses DROP COLUMN IF EXISTS credit_card_id;
