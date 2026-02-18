-- Actualización de Categorías y Sistema de Vehículos Múltiples
-- Ejecutar en el Editor SQL de Supabase

-- 1. Limpiar y actualizar categorías de vehículos
TRUNCATE TABLE vehicle_categories CASCADE;

INSERT INTO vehicle_categories (id, name, base_price, price_per_km, description)
VALUES 
(1, 'Auto', 1500.00, 150.00, 'Ideal para paquetes pequeños, sobres o cajas chicas.'),
(2, 'Utilitario', 3500.00, 250.00, 'Tipo Kangoo/Partner. Para muebles chicos o varias cajas.'),
(3, 'Camioneta', 6000.00, 400.00, 'Tipo Hilux/F100. Ideal para fletes de tamaño medio.'),
(4, 'Camión', 12000.00, 750.00, 'Para mudanzas grandes o mercadería pesada.');

-- 2. Mejorar la tabla de vehículos para soportar múltiples y verificación
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS justification TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- 3. Agregar campo para rastrear qué vehículo está usando el chofer actualmente
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS active_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL;

-- 4. Actualizar la vista de info del chofer para usar el vehículo activo
CREATE OR REPLACE VIEW driver_info AS
SELECT 
    p.id as driver_id,
    p.full_name,
    p.phone,
    v.id as vehicle_id,
    v.brand,
    v.model,
    v.year,
    v.license_plate,
    v.color,
    v.verification_status as vehicle_status,
    vc.name as vehicle_category,
    vc.id as category_id,
    p.active_vehicle_id
FROM profiles p
LEFT JOIN vehicles v ON p.active_vehicle_id = v.id
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
WHERE p.role = 'driver';

-- 5. Función para que el chofer cambie su vehículo activo
CREATE OR REPLACE FUNCTION set_active_vehicle(p_driver_id UUID, p_vehicle_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar que el vehículo pertenezca al chofer y esté aprobado
    IF EXISTS (
        SELECT 1 FROM vehicles 
        WHERE id = p_vehicle_id 
        AND driver_id = p_driver_id 
        AND verification_status = 'approved'
    ) THEN
        -- Desactivar todos los vehículos del chofer
        UPDATE vehicles SET is_active = false WHERE driver_id = p_driver_id;
        -- Activar el elegido
        UPDATE vehicles SET is_active = true WHERE id = p_vehicle_id;
        -- Actualizar el perfil
        UPDATE profiles SET active_vehicle_id = p_vehicle_id WHERE id = p_driver_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;
