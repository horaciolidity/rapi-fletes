-- Script para actualizar estadísticas del administrador incluyendo verificación de vehículos
-- Ejecutar en el SQL Editor de Supabase

DROP VIEW IF EXISTS admin_stats CASCADE;

CREATE OR REPLACE VIEW admin_stats AS
SELECT
    -- Usuarios
    (SELECT COUNT(*) FROM profiles WHERE role = 'client') as total_clients,
    (SELECT COUNT(*) FROM profiles WHERE role = 'driver') as total_drivers,
    (SELECT COUNT(*) FROM profiles) as total_users,
    
    -- Viajes
    (SELECT COUNT(*) FROM fletes WHERE status = 'completed') as total_completed_trips,
    (SELECT COUNT(*) FROM fletes WHERE status = 'cancelled') as total_cancelled_trips,
    (SELECT COUNT(*) FROM fletes WHERE created_at >= NOW() - INTERVAL '24 hours') as trips_today,
    
    -- Reclamos
    (SELECT COUNT(*) FROM complaints WHERE status = 'pending') as pending_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'in_progress') as in_progress_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'resolved') as resolved_complaints,
    (SELECT COUNT(*) FROM complaints WHERE created_at >= NOW() - INTERVAL '24 hours') as complaints_today,
    
    -- Usuarios baneados
    (SELECT COUNT(*) FROM user_bans WHERE is_active = true) as active_bans,
    
    -- VEHÍCULOS PENDIENTES DE VERIFICACIÓN (Nuevo campo)
    (SELECT COUNT(*) FROM vehicles WHERE verification_status = 'pending') as pending_vehicles,
    
    -- Ingresos (suma de viajes completados)
    (SELECT COALESCE(SUM(estimated_price), 0) FROM fletes WHERE status = 'completed') as total_revenue;

-- RLS para la tabla vehicles (permitir a admins gestionar todo)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all vehicles" ON vehicles;
CREATE POLICY "Admins can manage all vehicles" ON vehicles
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Asegurar que los choferes puedan ver sus propios vehículos
DROP POLICY IF EXISTS "Drivers can view their own vehicles" ON vehicles;
CREATE POLICY "Drivers can view their own vehicles" ON vehicles
FOR SELECT
TO authenticated
USING (driver_id = auth.uid());

-- Asegurar que los choferes puedan insertar sus propios vehículos
DROP POLICY IF EXISTS "Drivers can insert their own vehicles" ON vehicles;
CREATE POLICY "Drivers can insert their own vehicles" ON vehicles
FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());
