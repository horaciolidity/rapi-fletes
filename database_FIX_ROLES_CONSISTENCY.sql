-- UNIFICACIÓN DE ROLES Y FIX DE PERMISOS
-- Ejecutar en Supabase SQL Editor

-- 1. Asegurar que todos los que eran 'user' ahora sean 'client' para ser consistentes con las estadísticas
UPDATE profiles SET role = 'client' WHERE role = 'user';

-- 2. Asegurar que el CHECK constraint (si existe) acepte 'client'
-- Nota: En Supabase usualmente no hay check constraint por defecto a menos que se haya creado manualmente.
-- Si existe, lo borramos y creamos uno nuevo con 'client'.
DO $$
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'driver', 'client', 'user'));
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 3. Fix para evitar recursión en RLS de perfiles (asegurar versión limpia)
DROP POLICY IF EXISTS "profiles_update_self_v3" ON profiles;
CREATE POLICY "profiles_update_self_v3"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Asegurar que el admin pueda seguir haciendo lo suyo
DROP POLICY IF EXISTS "profiles_admin_update_v3" ON profiles;
CREATE POLICY "profiles_admin_update_v3"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_admin_final());
