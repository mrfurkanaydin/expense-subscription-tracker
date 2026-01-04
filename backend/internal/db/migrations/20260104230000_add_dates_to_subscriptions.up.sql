ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS end_date DATE;

-- Mevcut kayıtlar için created_at'i start_date olarak ayarla (opsiyonel ama mantıklı)
UPDATE subscriptions SET start_date = created_at::DATE;
