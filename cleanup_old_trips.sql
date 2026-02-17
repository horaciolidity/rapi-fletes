-- Limpiar todos los viajes existentes para empezar de cero
-- Ejecuta esto en Supabase SQL Editor

-- 1. Eliminar todos los fletes (viajes)
DELETE FROM fletes;

-- 2. Reiniciar el contador de IDs (opcional)
-- ALTER SEQUENCE fletes_id_seq RESTART WITH 1;

-- Verificar que se eliminaron todos
SELECT COUNT(*) as total_fletes FROM fletes;

-- Deberías ver: total_fletes = 0
