-- Add storage columns for profile and vehicle verification
-- Execute this in Supabase SQL Editor

-- 1. Add photo column to profiles for profile picture
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add documentation and photo columns to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS doc_license_url TEXT; -- Licencia de conducir
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS doc_insurance_url TEXT; -- Seguro
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS doc_vnt_url TEXT; -- Registro/VNT/Cédula

-- 3. Comments for documentation
COMMENT ON COLUMN profiles.avatar_url IS 'URL de la foto de perfil del usuario (Firebase/Supabase Storage)';
COMMENT ON COLUMN vehicles.photo_url IS 'URL de la foto del vehículo';
COMMENT ON COLUMN vehicles.doc_license_url IS 'URL del documento de licencia del chofer';
COMMENT ON COLUMN vehicles.doc_insurance_url IS 'URL del comprobante de seguro';
COMMENT ON COLUMN vehicles.doc_vnt_url IS 'URL de la cédula verde/azul o VNT';
