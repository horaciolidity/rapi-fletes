-- Enable RLS for tables missing it
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Views were reported as SECURITY DEFINER. 
-- In most cases, these should be SECURITY INVOKER to obey the querying user's RLS.
-- However, creating them as INVOKER might break them if the user doesn't have permissions on the underlying tables.
-- But for Admin stats, we often want definer to aggregate, though and better to use a function or careful policies.
-- Let's redefine reported_users_ranking, driver_info, wallet_history, and admin_stats as INVOKER if possible.

-- Redefine reported_users_ranking
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

-- Redefine driver_info
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
    v.plate,
    c.name as category_name
FROM profiles p
LEFT JOIN vehicles v ON p.id = v.driver_id
LEFT JOIN vehicle_categories c ON v.category_id = c.id
WHERE p.role = 'driver';

-- Redefine wallet_history
DROP VIEW IF EXISTS public.wallet_history;
CREATE VIEW public.wallet_history WITH (security_invoker = true) AS
SELECT 
    id,
    wallet_id,
    amount,
    type,
    description,
    created_at
FROM wallet_transactions
ORDER BY created_at DESC;

-- Redefine admin_stats
DROP VIEW IF EXISTS public.admin_stats;
CREATE VIEW public.admin_stats WITH (security_invoker = true) AS
SELECT
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE role = 'client') as total_clients,
    (SELECT COUNT(*) FROM profiles WHERE role = 'driver') as total_drivers,
    (SELECT COUNT(*) FROM trips WHERE status = 'completed') as total_completed_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'cancelled') as total_cancelled_trips,
    (SELECT COUNT(*) FROM trips WHERE created_at >= NOW() - INTERVAL '24 hours') as trips_today,
    (SELECT COALESCE(SUM(total_price), 0) FROM trips WHERE status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM complaints WHERE status = 'pending') as pending_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'in_progress') as in_progress_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'resolved') as resolved_complaints,
    (SELECT COUNT(*) FROM complaints WHERE created_at >= NOW() - INTERVAL '24 hours') as complaints_today,
    (SELECT COUNT(*) FROM vehicles WHERE status = 'pending') as pending_vehicles,
    (SELECT COUNT(*) FROM user_bans WHERE active = true) as active_bans;
