-- FIX FOR RLS POLICIES - RESTORING ACCESS
-- Run this in Supabase SQL Editor

-- 1. PROFILES Table
-- Enable RLS (already should be, but just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- 2. VEHICLE_CATEGORIES Table
-- Allow everyone to read categories
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.vehicle_categories;
CREATE POLICY "Categories are viewable by everyone" ON public.vehicle_categories
FOR SELECT TO authenticated, anon
USING (true);

-- 3. APP_SETTINGS Table
-- Allow everyone to read settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can read settings" ON public.app_settings;
CREATE POLICY "Everyone can read settings" ON public.app_settings
FOR SELECT TO authenticated, anon
USING (true);

-- 4. FLETES (Trips) Table
-- If RLS is enabled, ensure users can see their own
ALTER TABLE public.fletes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own fletes as client" ON public.fletes;
CREATE POLICY "Users can view own fletes as client" ON public.fletes
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Drivers can view assigned fletes" ON public.fletes;
CREATE POLICY "Drivers can view assigned fletes" ON public.fletes
FOR SELECT TO authenticated
USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Admins can view all fletes" ON public.fletes;
CREATE POLICY "Admins can view all fletes" ON public.fletes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- 5. COMPLAINTS Table
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own complaints" ON public.complaints;
CREATE POLICY "Users can view own complaints" ON public.complaints
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage complaints" ON public.complaints;
CREATE POLICY "Admins can manage complaints" ON public.complaints
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- 6. WALLETS and TRANSACTIONS (Optional but safe)
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Drivers can view own wallet" ON public.wallets;
CREATE POLICY "Drivers can view own wallet" ON public.wallets
FOR SELECT TO authenticated
USING (auth.uid() = driver_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM wallets w
    WHERE w.id = wallet_id AND w.driver_id = auth.uid()
  )
);

-- 7. ACTIVITY_LOGS, WARNINGS, BANS (Admin only)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view logs" ON public.activity_logs;
CREATE POLICY "Admins can view logs" ON public.activity_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view warnings" ON public.user_warnings;
CREATE POLICY "Admins can view warnings" ON public.user_warnings
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view bans" ON public.user_bans;
CREATE POLICY "Admins can view bans" ON public.user_bans
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);
