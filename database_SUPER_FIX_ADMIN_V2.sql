-- SCRIPT DE REPARACIÓN DEFINITIVO v2
-- Ejecutar en Supabase SQL Editor

-- 1. Forzar tu rol de administrador buscando por email en la tabla interna de auth
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'horaciowalterortiz@gmail.com' LIMIT 1);

-- 2. Asegurar columnas de verificación en la tabla vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS justification TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 3. Recrear Vista de Estadísticas (Paso crítico para que el contador no dé error)
DROP VIEW IF EXISTS admin_stats CASCADE;
CREATE OR REPLACE VIEW admin_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles WHERE role = 'client') as total_clients,
    (SELECT COUNT(*) FROM profiles WHERE role = 'driver') as total_drivers,
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM fletes WHERE status = 'completed') as total_completed_trips,
    (SELECT COUNT(*) FROM fletes WHERE status = 'pending') as pending_complaints,
    (SELECT COUNT(*) FROM user_bans WHERE is_active = true) as active_bans,
    (SELECT COUNT(*) FROM vehicles WHERE verification_status = 'pending') as pending_vehicles,
    (SELECT COALESCE(SUM(estimated_price), 0) FROM fletes WHERE status = 'completed') as total_revenue;

-- 4. Liberar Políticas de Seguridad (RLS) para el Admin
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON vehicles;
CREATE POLICY "Admins can manage all vehicles" ON vehicles
AS PERMISSIVE FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Permitir que el admin vea todos los perfiles (para ver nombres de choferes)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
