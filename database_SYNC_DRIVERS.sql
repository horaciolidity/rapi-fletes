-- SCRIPT DE SINCRONIZACIÓN DE CONDUCTORES
-- Ejecutar en Supabase SQL Editor para arreglar choferes en "limbo"

-- 1. Marcar como 'verified' a todos los choferes que tengan al menos un vehículo aprobado
UPDATE profiles
SET verification_status = 'verified'
WHERE id IN (
    SELECT driver_id 
    FROM vehicles 
    WHERE verification_status = 'approved'
);

-- 2. Asegurar que tengan un vehículo activo si ya están aprobados
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT p.id as driver_id, v.id as vehicle_id
        FROM profiles p
        JOIN vehicles v ON v.driver_id = p.id
        WHERE p.verification_status = 'verified'
        AND p.active_vehicle_id IS NULL
        AND v.verification_status = 'approved'
        LIMIT 100
    ) LOOP
        -- Usar la función RPC que ya creamos para activar el vehículo
        PERFORM set_active_vehicle(r.driver_id, r.vehicle_id);
    END LOOP;
END $$;

-- 3. (Opcional) Ver cuántos choferes arreglamos
SELECT full_name, role, verification_status 
FROM profiles 
WHERE role = 'driver';
