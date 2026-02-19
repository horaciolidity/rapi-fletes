-- Actualización de precios por vehículo
-- Ejecutar en el Editor SQL de Supabase

UPDATE vehicle_categories
SET base_price = 3000.00, price_per_km = 950.00
WHERE id = 1; -- Auto

UPDATE vehicle_categories
SET base_price = 3200.00, price_per_km = 1090.00
WHERE id = 2; -- Utilitario

UPDATE vehicle_categories
SET base_price = 4300.00, price_per_km = 1800.00
WHERE id = 3; -- Camioneta

UPDATE vehicle_categories
SET base_price = 16000.00, price_per_km = 6200.00
WHERE id = 4; -- Camión
