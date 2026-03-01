-- CORRECCIÓN DEL SCRIPT DE SEGURIDAD
-- Ejecutar en el Editor SQL de Supabase

-- 1. Asegurar que la columna is_verified existe en profiles
-- (Parece que se estaba intentando usar pero no existía en la tabla profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Activar RLS en las tablas reportadas por el linter
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- 3. Recrear las vistas usando SECURITY INVOKER (security_invoker = true)
-- Esto soluciona los errores de "Security Definer View"

-- reported_users_ranking
DROP VIEW IF EXISTS public.reported_users_ranking;
CREATE VIEW public.reported_users_ranking WITH (security_invoker = true) AS
SELECT 
    u.id,
    u.full_name,
    COUNT(w.id) as warning_count,
    MAX(w.created_at) as last_warning
FROM profiles u
LEFT JOIN user_warnings w ON u.id = w.user_id
GROUP BY u.id, u.full_name
ORDER BY warning_count DESC;

-- driver_info
DROP VIEW IF EXISTS public.driver_info;
CREATE VIEW public.driver_info WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.is_verified,
    v.brand,
    v.model,
    v.license_plate as plate, -- Usamos el nombre correcto de la columna
    c.name as category_name
FROM profiles p
LEFT JOIN vehicles v ON p.id = v.driver_id
LEFT JOIN vehicle_categories c ON v.category_id = c.id
WHERE p.role = 'driver';

-- wallet_history (Asumiendo que la tabla se llama wallet_transactions o similar, 
-- según lo que vimos en scripts previos. Ajusto a transactions que es lo que vi en useAdminStore)
DROP VIEW IF EXISTS public.wallet_history;
CREATE VIEW public.wallet_history WITH (security_invoker = true) AS
SELECT 
    id,
    wallet_id,
    amount,
    transaction_category as type, -- Ajustado según useAdminStore filters
    description,
    created_at
FROM transactions
ORDER BY created_at DESC;

-- admin_stats (Recreada de forma robusta)
DROP VIEW IF EXISTS public.admin_stats;
CREATE VIEW public.admin_stats WITH (security_invoker = true) AS
SELECT
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE role = 'client') as total_clients,
    (SELECT COUNT(*) FROM profiles WHERE role = 'driver') as total_drivers,
    (SELECT COUNT(*) FROM fletes WHERE status = 'completed') as total_completed_trips,
    (SELECT COUNT(*) FROM fletes WHERE status = 'cancelled') as total_cancelled_trips,
    (SELECT COUNT(*) FROM fletes WHERE created_at >= NOW() - INTERVAL '24 hours') as trips_today,
    (SELECT COALESCE(SUM(estimated_price), 0) FROM fletes WHERE status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM complaints WHERE status = 'pending') as pending_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'in_progress') as in_progress_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'resolved') as resolved_complaints,
    (SELECT COUNT(*) FROM complaints WHERE created_at >= NOW() - INTERVAL '24 hours') as complaints_today,
    (SELECT COUNT(*) FROM vehicles WHERE verification_status = 'pending') as pending_vehicles,
    (SELECT COUNT(*) FROM user_bans WHERE is_active = true) as active_bans;
