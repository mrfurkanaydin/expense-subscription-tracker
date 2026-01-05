-- Add credit_card_id to expenses table
ALTER TABLE expenses ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;

-- Add credit_card_id to subscriptions table
ALTER TABLE subscriptions ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;

-- Create indexes for faster lookups
CREATE INDEX idx_expenses_credit_card_id ON expenses(credit_card_id);
CREATE INDEX idx_subscriptions_credit_card_id ON subscriptions(credit_card_id);
