-- SCRIPT DE REPARACIÓN FINAL (ROBUSTO)
-- Ejecutar en Supabase SQL Editor

-- 1. Limpiar políticas previas para evitar el error "Already Exists"
DROP POLICY IF EXISTS "profiles_read_v3" ON profiles;
DROP POLICY IF EXISTS "authenticated_profiles_read" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "authenticated_profiles_access" ON profiles;

DROP POLICY IF EXISTS "vehicles_admin_v3" ON vehicles;
DROP POLICY IF EXISTS "admin_manage_vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON vehicles;

-- 2. Crear función de seguridad DEFINER (Rompe la recursión infinita)
CREATE OR REPLACE FUNCTION public.is_admin_final()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Aplicar políticas limpias en PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_v3"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_update_self_v3"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 4. Aplicar políticas limpias en VEHICLES
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicles_admin_v3"
ON vehicles FOR ALL
TO authenticated
USING (public.is_admin_final());

CREATE POLICY "vehicles_driver_v3"
ON vehicles FOR SELECT
TO authenticated
USING (driver_id = auth.uid());

CREATE POLICY "vehicles_driver_insert_v3"
ON vehicles FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());

-- 5. Forzar tu rol de ADMIN (Usando búsqueda por email interna)
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'horaciowalterortiz@gmail.com' LIMIT 1);

-- 6. Recargar Vista de Estadísticas
DROP VIEW IF EXISTS admin_stats CASCADE;
CREATE OR REPLACE VIEW admin_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles WHERE role = 'client') as total_clients,
    (SELECT COUNT(*) FROM profiles WHERE role = 'driver') as total_drivers,
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM vehicles WHERE verification_status = 'pending') as pending_vehicles,
    (SELECT COUNT(*) FROM fletes WHERE status = 'completed') as total_completed_trips,
    (SELECT COALESCE(SUM(estimated_price), 0) FROM fletes WHERE status = 'completed') as total_revenue;
