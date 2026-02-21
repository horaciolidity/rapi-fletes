-- PANEL ADMIN TOTAL CONTROL - DATABASE EXTENSIONS
-- Executed as a super-user/admin in Supabase

-- 1. App Global Settings
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize Defaults
INSERT INTO app_settings (key, value, description)
VALUES 
('currency_symbol', '$', 'Símbolo de la moneda local'),
('country_code', 'AR', 'Código de país origen')
ON CONFLICT (key) DO NOTHING;

-- 2. Update Complaints to track reported user
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS reported_user_id UUID REFERENCES profiles(id);
CREATE INDEX IF NOT EXISTS idx_complaints_reported_user_id ON complaints(reported_user_id);

-- 3. Trigger to auto-log settings changes
CREATE OR REPLACE FUNCTION log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_activity(
        NULL, -- Admin ID will be captured if possible, otherwise NULL
        'settings_updated',
        'setting',
        NULL,
        jsonb_build_object(
            'key', NEW.key,
            'old_value', OLD.value,
            'new_value', NEW.value
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_settings_change ON app_settings;
CREATE TRIGGER trigger_log_settings_change
    AFTER UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION log_settings_change();

-- 4. View for Problematic Users (Top reported)
CREATE OR REPLACE VIEW reported_users_ranking AS
SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.role,
    COUNT(c.id) as complaint_count,
    (SELECT COUNT(*) FROM user_warnings WHERE user_id = p.id) as warning_count
FROM profiles p
JOIN complaints c ON p.id = c.reported_user_id
GROUP BY p.id
ORDER BY complaint_count DESC;

-- 5. RLS for app_settings (Only admins can write)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do anything on settings"
ON app_settings
FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Everyone can read settings"
ON app_settings
FOR SELECT
USING (true);
