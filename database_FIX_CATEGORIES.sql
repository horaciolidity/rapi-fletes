-- FIX: Add missing updated_at column to vehicle_categories
ALTER TABLE vehicle_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Also ensure app_settings exists and has initial data just in case
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (key, value, description)
VALUES 
('currency_symbol', '$', 'Símbolo de la moneda local'),
('country_code', 'AR', 'Código de país origen')
ON CONFLICT (key) DO NOTHING;
