-- SCRIPT DE REPARACIÓN DE RECURSIÓN v3
-- Ejecutar en Supabase SQL Editor para solucionar el Error 500

-- 1. Limpieza de políticas que causan el bucle infinito
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON vehicles;

-- 2. Función de seguridad (SECURITY DEFINER) para romper la recursión
-- Esta función comprueba el rol de admin sin disparar el RLS de nuevo.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Políticas para la tabla PROFILES
-- Permitir lectura básica a todos los logueados para que la APP funcione (ver nombres de choferes, etc)
CREATE POLICY "authenticated_profiles_read"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Permitir actualización solo al dueño
CREATE POLICY "profiles_update_self"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 4. Políticas para la tabla VEHICLES
-- Permitir al Admin gestionar todo usando la función segura
CREATE POLICY "admin_manage_vehicles"
ON vehicles FOR ALL
TO authenticated
USING (public.check_is_admin());

-- Permitir a los choferes gestionar los suyos
CREATE POLICY "driver_manage_own_vehicles"
ON vehicles FOR ALL
TO authenticated
USING (driver_id = auth.uid());

-- 5. Asegurar que tu cuenta sea ADMIN
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'horaciowalterortiz@gmail.com' LIMIT 1);

-- 6. Actualizar las estadísticas para el Dashboard
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
