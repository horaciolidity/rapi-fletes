-- Script to add province filtering
-- Execute this in Supabase SQL Editor

-- 1. Add columns to store province information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE fletes ADD COLUMN IF NOT EXISTS pickup_province TEXT;

-- 2. Add indexes to improve filtering performance
CREATE INDEX IF NOT EXISTS idx_fletes_pickup_province ON fletes(pickup_province);
CREATE INDEX IF NOT EXISTS idx_fletes_status_province ON fletes(status, pickup_province);
CREATE INDEX IF NOT EXISTS idx_profiles_province ON profiles(province);

-- 3. Comments for documentation
COMMENT ON COLUMN profiles.province IS 'Provincia de residencia/operación del usuario (principalmente para choferes)';
COMMENT ON COLUMN fletes.pickup_province IS 'Provincia donde se origina el viaje (extraída del geocoding)';
