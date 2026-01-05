-- Add payment_method to expenses table
ALTER TABLE expenses ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cash';

-- Update existing expenses that have credit_card_id to use credit_card payment method
UPDATE expenses SET payment_method = 'credit_card' WHERE credit_card_id IS NOT NULL;
