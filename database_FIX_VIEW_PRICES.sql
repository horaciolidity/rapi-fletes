-- Corrección para la vista driver_info y actualización de precios
-- Ejecutar en el Editor SQL de Supabase

-- 1. Eliminar la vista existente para poder recrearla con nuevos nombres de columna
DROP VIEW IF EXISTS driver_info;

-- 2. Actualizar los precios (por si acaso no se aplicaron antes)
UPDATE vehicle_categories SET base_price = 3000.00, price_per_km = 950.00 WHERE id = 1; -- Auto
UPDATE vehicle_categories SET base_price = 3200.00, price_per_km = 1090.00 WHERE id = 2; -- Utilitario
UPDATE vehicle_categories SET base_price = 4300.00, price_per_km = 1800.00 WHERE id = 3; -- Camioneta
UPDATE vehicle_categories SET base_price = 16000.00, price_per_km = 6200.00 WHERE id = 4; -- Camión

-- 3. Recrear la vista con la estructura correcta
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
