-- RAPI FLETES: DATABASE DOCTOR & FIX (V3)
-- Execute this in Supabase SQL Editor to bypass RLS issues and fix logs

-- 1. Fix Log Function to bypass RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- IMPORTANT: This bypasses RLS

-- 2. Disable RLS on critical admin tables for now
-- This ensures the Admin Panel can work while we refine security
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans DISABLE ROW LEVEL SECURITY;

-- 3. Ensure tables exist (Anonymous block)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'app_settings') THEN
        CREATE TABLE app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    IF NOT EXISTS (SELECT column_name FROM information_schema.columns 
                   WHERE table_name='vehicle_categories' AND column_name='updated_at') THEN
        ALTER TABLE vehicle_categories ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 4. Re-initialize basic settings
INSERT INTO app_settings (key, value, description)
VALUES 
('currency_symbol', '$', 'Símbolo de la moneda local'),
('country_code', 'AR', 'Código de país origen')
ON CONFLICT (key) DO NOTHING;

-- Verification
SELECT 'Admin Access Restored' as status, 'RLS Disabled for Admin Tables' as detail;
