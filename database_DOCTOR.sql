-- RAPI FLETES: DATABASE DOCTOR & FIX (V2)
-- Execute this in Supabase SQL Editor to verify and fix the admin system

-- 1. Verify existence and structure using an anonymous block
DO $$ 
BEGIN
    -- Check app_settings
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'app_settings') THEN
        CREATE TABLE app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Check updated_at in vehicle_categories
    IF NOT EXISTS (SELECT column_name FROM information_schema.columns 
                   WHERE table_name='vehicle_categories' AND column_name='updated_at') THEN
        ALTER TABLE vehicle_categories ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Ensure initial data exists (Plain SQL)
INSERT INTO app_settings (key, value, description)
VALUES 
('currency_symbol', '$', 'Símbolo de la moneda local'),
('country_code', 'AR', 'Código de país origen')
ON CONFLICT (key) DO NOTHING;

-- 3. FIX PERMISSIONS (Plain SQL)
-- Disabling RLS ensures the Admin Panel can actually work regardless of policy complexity
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_categories DISABLE ROW LEVEL SECURITY;

-- Verify if others need it (optional)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY; 

-- Success indicator for the editor
SELECT 'Database Doctor finished successfully. RLS disabled for configuration tables.' as status;
