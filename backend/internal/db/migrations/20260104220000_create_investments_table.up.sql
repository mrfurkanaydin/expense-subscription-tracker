CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'metal', 'stock_us', 'stock_bist', 'fund', 'bes'
    symbol VARCHAR(20) NOT NULL, -- 'XAU', 'AAPL', 'THYAO', etc.
    name VARCHAR(255) NOT NULL,
    quantity NUMERIC(18,8) NOT NULL,
    purchase_price NUMERIC(18,4) NOT NULL,
    purchase_currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
