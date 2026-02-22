-- Script to setup Supabase Storage for Rapi Fletes
-- Execute this in Supabase SQL Editor

-- 1. Create buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS for Storage (usually enabled by default, but let's be sure)
-- Policies for 'profiles' bucket
CREATE POLICY "Public profiles are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policies for 'vehicles' bucket
CREATE POLICY "Vehicle docs are viewable by admins and owners"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vehicles' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

CREATE POLICY "Drivers can upload their own vehicle docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicles' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Drivers can update their own vehicle docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicles' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
