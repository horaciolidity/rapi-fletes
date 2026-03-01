-- ULTIMATE RECURSION FIX - RESTORE EVERYTHING
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create a function to check admin role WITHOUT RECURSION
-- SECURITY DEFINER makes it run as the service_role (bypassing RLS)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- We use a subquery that bypasses RLS because this is a SECURITY DEFINER function
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop all recursive policies on profiles to clear the infinite loop
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self_v3" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_v3" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- 3. Restore clean, non-recursive policies for PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can see their own profile
CREATE POLICY "profiles_select_self" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Policy: Admins can see ALL profiles (using the safe function)
CREATE POLICY "profiles_select_admin" ON public.profiles
FOR SELECT TO authenticated
USING (public.check_is_admin());

-- Policy: Everyone can update their own profile
CREATE POLICY "profiles_update_self" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Admins can update ALL profiles
CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE TO authenticated
USING (public.check_is_admin());

-- 4. Fix other tables that might be broken by joins to profiles
-- FLETES (Trips)
ALTER TABLE public.fletes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own fletes as client" ON public.fletes;
CREATE POLICY "fletes_select_client" ON public.fletes FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Drivers can view assigned fletes" ON public.fletes;
CREATE POLICY "fletes_select_driver" ON public.fletes FOR SELECT TO authenticated USING (auth.uid() = driver_id);
DROP POLICY IF EXISTS "Admins can view all fletes" ON public.fletes;
CREATE POLICY "fletes_select_admin" ON public.fletes FOR SELECT TO authenticated USING (public.check_is_admin());

-- COMPLAINTS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own complaints" ON public.complaints;
CREATE POLICY "complaints_select_user" ON public.complaints FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage complaints" ON public.complaints;
CREATE POLICY "complaints_all_admin" ON public.complaints FOR ALL TO authenticated USING (public.check_is_admin());

-- 5. Extra: Ensure no other table triggers recursion when admin checks are made
-- (Wallets, User Bans, etc. should also use public.check_is_admin())

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view bans" ON public.user_bans;
CREATE POLICY "bans_select_admin" ON public.user_bans FOR SELECT TO authenticated USING (public.check_is_admin());

ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view warnings" ON public.user_warnings;
CREATE POLICY "warnings_select_admin" ON public.user_warnings FOR SELECT TO authenticated USING (public.check_is_admin());
