-- Script SQL para agregar tabla de vehículos y mejorar info del chofer
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla de vehículos
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    license_plate VARCHAR(20) UNIQUE,
    color VARCHAR(50),
    category_id INTEGER REFERENCES vehicle_categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agregar campo de vehículo a profiles (opcional, para referencia rápida)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id);

-- 3. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);

-- 4. Comentarios para documentación
COMMENT ON TABLE vehicles IS 'Información de vehículos de los choferes';
COMMENT ON COLUMN vehicles.driver_id IS 'ID del chofer propietario del vehículo';
COMMENT ON COLUMN vehicles.license_plate IS 'Patente/matrícula del vehículo';
COMMENT ON COLUMN vehicles.category_id IS 'Categoría del vehículo (pickup, van, etc.)';

-- 5. Función para calcular calificación promedio del chofer
CREATE OR REPLACE FUNCTION get_driver_average_rating(driver_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT COALESCE(AVG(client_rating), 0)::DECIMAL(3,2)
    INTO avg_rating
    FROM fletes
    WHERE driver_id = driver_uuid
    AND client_rating IS NOT NULL;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para contar total de viajes del chofer
CREATE OR REPLACE FUNCTION get_driver_total_trips(driver_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_trips INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total_trips
    FROM fletes
    WHERE driver_id = driver_uuid
    AND status = 'completed';
    
    RETURN total_trips;
END;
$$ LANGUAGE plpgsql;

-- 7. Vista para obtener info completa del chofer (opcional, para queries más fáciles)
CREATE OR REPLACE VIEW driver_info AS
SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.email,
    v.brand,
    v.model,
    v.year,
    v.license_plate,
    v.color,
    vc.name as vehicle_category,
    get_driver_average_rating(p.id) as average_rating,
    get_driver_total_trips(p.id) as total_trips
FROM profiles p
LEFT JOIN vehicles v ON p.id = v.driver_id
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
WHERE p.role = 'driver';

-- 8. Insertar datos de ejemplo (OPCIONAL - solo para testing)
-- Descomenta si quieres datos de prueba
/*
INSERT INTO vehicles (driver_id, brand, model, year, license_plate, color, category_id)
SELECT 
    p.id,
    'Toyota',
    'Hilux',
    2020,
    'ABC123',
    'Blanco',
    vc.id
FROM profiles p
CROSS JOIN vehicle_categories vc
WHERE p.role = 'driver'
AND vc.name = 'Pickup'
LIMIT 1;
*/
