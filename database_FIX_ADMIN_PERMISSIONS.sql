-- FIX PARA PERMISOS DE ACTUALIZACIÓN DE PERFIL POR ADMIN
-- Ejecutar en Supabase SQL Editor

-- 1. Permitir que los administradores actualicen cualquier perfil
-- (Esto es necesario para que cuando apruebes un vehículo, el sistema pueda marcar al chofer como 'verified')
DROP POLICY IF EXISTS "profiles_admin_update_v3" ON profiles;
CREATE POLICY "profiles_admin_update_v3"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_admin_final());

-- 2. Asegurar que el admin pueda insertar logs de actividad (si no podía)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage logs" ON activity_logs;
CREATE POLICY "Admins can manage logs"
ON activity_logs FOR ALL
TO authenticated
USING (public.is_admin_final());

-- 3. Permitir que los usuarios vean sus propios logs (opcional pero recomendado)
DROP POLICY IF EXISTS "Users can view own logs" ON activity_logs;
CREATE POLICY "Users can view own logs"
ON activity_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());
