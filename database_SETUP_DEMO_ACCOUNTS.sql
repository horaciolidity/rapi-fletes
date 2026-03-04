-- Database script to set up demo accounts

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_admin_id uuid := '11111111-1111-1111-1111-111111111111';
    v_driver_id uuid := '22222222-2222-2222-2222-222222222222';
    v_passenger_id uuid := '33333333-3333-3333-3333-333333333333';
    demo_password text := crypt('demo1234', gen_salt('bf'));
    
    cat_utilitario_id int;
    cat_camioneta_id int;
    cat_camion_id int;
BEGIN

    -- 1. Create users in auth.users
    DELETE FROM auth.users WHERE email IN ('admin@demo.com', 'chofer@demo.com', 'pasajero@demo.com');

    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES
    (v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@demo.com', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Demo", "role":"admin"}', now(), now(), '', '', '', ''),
    (v_driver_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'chofer@demo.com', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Chofer Demo", "role":"driver"}', now(), now(), '', '', '', ''),
    (v_passenger_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pasajero@demo.com', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pasajero Demo", "role":"user"}', now(), now(), '', '', '', '');

    -- 2. Create profiles
    DELETE FROM public.profiles WHERE id IN (v_admin_id, v_driver_id, v_passenger_id);

    INSERT INTO public.profiles (id, full_name, role, verification_status)
    VALUES
    (v_admin_id, 'Admin Demo', 'admin', 'verified'),
    (v_driver_id, 'Chofer Demo', 'driver', 'verified'),
    (v_passenger_id, 'Pasajero Demo', 'user', 'verified');

    -- 3. Get category IDs
    SELECT id INTO cat_utilitario_id FROM public.vehicle_categories WHERE name ILIKE '%utilitario%' LIMIT 1;
    SELECT id INTO cat_camioneta_id FROM public.vehicle_categories WHERE name ILIKE '%camioneta%' LIMIT 1;
    SELECT id INTO cat_camion_id FROM public.vehicle_categories WHERE name ILIKE '%camion%' LIMIT 1;

    -- 4. Create Vehicles for Chofer Demo
    DELETE FROM public.vehicles WHERE driver_id = v_driver_id;

    INSERT INTO public.vehicles (id, driver_id, brand, model, year, license_plate, category_id, verification_status)
    VALUES
    (gen_random_uuid(), v_driver_id, 'RENAULT', 'KANGOO', 2021, 'DEM111', COALESCE(cat_utilitario_id, 1), 'approved'),
    (gen_random_uuid(), v_driver_id, 'FORD', 'F-100', 2018, 'DEM222', COALESCE(cat_camioneta_id, 2), 'approved'),
    (gen_random_uuid(), v_driver_id, 'MERCEDES', 'ATEGO', 2019, 'DEM333', COALESCE(cat_camion_id, 3), 'approved');
    
    -- Pick the first one as active_vehicle_id
    UPDATE public.profiles
    SET active_vehicle_id = (SELECT id FROM public.vehicles WHERE driver_id = v_driver_id LIMIT 1)
    WHERE id = v_driver_id;

    -- 5. Create Wallet and add balance to Chofer Demo
    DELETE FROM public.wallets WHERE driver_id = v_driver_id;
    
    INSERT INTO public.wallets (driver_id, balance)
    VALUES (v_driver_id, 20000.00);

END $$;
