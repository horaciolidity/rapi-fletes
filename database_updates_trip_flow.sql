-- Script SQL completo para el flujo de viaje del chofer
-- Ejecutar en Supabase SQL Editor

-- 1. Primero, verificar y agregar las columnas necesarias
ALTER TABLE fletes 
ADD COLUMN IF NOT EXISTS trip_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trip_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS waiting_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS passenger_travels BOOLEAN DEFAULT false;

-- 2. Agregar columnas de calificaciones
ALTER TABLE fletes
ADD COLUMN IF NOT EXISTS driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
ADD COLUMN IF NOT EXISTS driver_notes TEXT,
ADD COLUMN IF NOT EXISTS client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
ADD COLUMN IF NOT EXISTS client_notes TEXT;

-- 3. Actualizar el tipo ENUM de status si existe, o crear constraint
-- Primero eliminar constraint anterior si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fletes_status_check'
    ) THEN
        ALTER TABLE fletes DROP CONSTRAINT fletes_status_check;
    END IF;
END $$;

-- Agregar nuevo constraint con todos los estados del flujo
ALTER TABLE fletes 
ADD CONSTRAINT fletes_status_check 
CHECK (status IN (
    'pending',        -- Cliente creó el pedido
    'accepted',       -- Chofer aceptó el viaje
    'arrived_pickup', -- Chofer arribó al origen (esperando carga)
    'in_transit',     -- Viaje en curso hacia destino
    'arrived_dropoff',-- Chofer arribó al destino (esperando descarga)
    'completed',      -- Viaje finalizado
    'cancelled'       -- Viaje cancelado
));

-- 4. Comentarios para documentación del flujo
COMMENT ON COLUMN fletes.status IS 'Estado del viaje: pending → accepted → arrived_pickup → in_transit → arrived_dropoff → completed';
COMMENT ON COLUMN fletes.trip_start_time IS 'Hora en que el chofer inicia el viaje hacia el destino (estado: in_transit)';
COMMENT ON COLUMN fletes.trip_end_time IS 'Hora en que el viaje se completa (estado: completed)';
COMMENT ON COLUMN fletes.waiting_time_minutes IS 'Tiempo de espera acumulado (carga + descarga)';
COMMENT ON COLUMN fletes.passenger_travels IS 'Indica si el cliente viaja con la carga o es solo paquetería';
COMMENT ON COLUMN fletes.driver_rating IS 'Calificación que el chofer da al cliente (1-5 estrellas)';
COMMENT ON COLUMN fletes.driver_notes IS 'Comentarios del chofer sobre el cliente/viaje';
COMMENT ON COLUMN fletes.client_rating IS 'Calificación que el cliente da al chofer (1-5 estrellas)';
COMMENT ON COLUMN fletes.client_notes IS 'Comentarios del cliente sobre el chofer/viaje';

-- 5. Índices para mejorar performance en consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_fletes_status ON fletes(status);
CREATE INDEX IF NOT EXISTS idx_fletes_driver_status ON fletes(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_fletes_created_at ON fletes(created_at DESC);
