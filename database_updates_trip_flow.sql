-- Script SQL para agregar columnas necesarias para el flujo completo del viaje
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas de tiempo y estado del viaje
ALTER TABLE fletes 
ADD COLUMN IF NOT EXISTS trip_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trip_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS waiting_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS passenger_travels BOOLEAN DEFAULT false;

-- Agregar columnas de calificaciones
ALTER TABLE fletes
ADD COLUMN IF NOT EXISTS driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
ADD COLUMN IF NOT EXISTS driver_notes TEXT,
ADD COLUMN IF NOT EXISTS client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
ADD COLUMN IF NOT EXISTS client_notes TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN fletes.trip_start_time IS 'Hora en que el chofer inicia el viaje (después de llegar al origen)';
COMMENT ON COLUMN fletes.trip_end_time IS 'Hora en que el viaje se completa';
COMMENT ON COLUMN fletes.waiting_time_minutes IS 'Tiempo de espera en el origen (en minutos)';
COMMENT ON COLUMN fletes.passenger_travels IS 'Indica si el cliente viaja con la carga o es solo paquetería';
COMMENT ON COLUMN fletes.driver_rating IS 'Calificación del chofer por parte del cliente (1-5 estrellas)';
COMMENT ON COLUMN fletes.driver_notes IS 'Comentarios del chofer sobre el viaje';
COMMENT ON COLUMN fletes.client_rating IS 'Calificación del cliente por parte del chofer (1-5 estrellas)';
COMMENT ON COLUMN fletes.client_notes IS 'Comentarios del cliente sobre el viaje';
