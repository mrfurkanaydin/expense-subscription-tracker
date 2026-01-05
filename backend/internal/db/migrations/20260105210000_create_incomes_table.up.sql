-- Create incomes table
CREATE TABLE incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'TRY',
    category VARCHAR(50) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_period VARCHAR(20),
    income_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_incomes_income_date ON incomes(income_date);
CREATE INDEX idx_incomes_category ON incomes(category);
