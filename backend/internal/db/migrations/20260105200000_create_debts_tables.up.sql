-- Create credit_cards table
CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100),
    last_four_digits VARCHAR(4),
    statement_day INT CHECK (statement_day BETWEEN 1 AND 31),
    due_day INT CHECK (due_day BETWEEN 1 AND 31),
    credit_limit NUMERIC(12,2),
    currency VARCHAR(3) DEFAULT 'TRY',
    color VARCHAR(7) DEFAULT '#6366F1',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debts table
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
    remaining_amount NUMERIC(12,2) NOT NULL CHECK (remaining_amount >= 0),
    currency VARCHAR(3) DEFAULT 'TRY',
    installment_count INT DEFAULT 1 CHECK (installment_count >= 1),
    paid_installments INT DEFAULT 0 CHECK (paid_installments >= 0),
    installment_amount NUMERIC(12,2),
    installment_type VARCHAR(20) DEFAULT 'fixed' CHECK (installment_type IN ('fixed', 'decreasing')),
    first_payment_date DATE NOT NULL,
    next_payment_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_credit_card_id ON debts(credit_card_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_next_payment_date ON debts(next_payment_date);
