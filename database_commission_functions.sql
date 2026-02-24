-- Funciones para el sistema de comisiones de Rapi Fletes
-- Ejecutar en Supabase SQL Editor

-- 1. Asegurar que fletes tenga las columnas de comisión
ALTER TABLE fletes 
ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(10,2) DEFAULT 0.00;

-- 2. Asegurar que vehicle_categories tenga la columna de comisión
ALTER TABLE vehicle_categories
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(10,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate < 100);

-- 3. Función para calcular la comisión de un viaje sin cobrarla
CREATE OR REPLACE FUNCTION calculate_trip_commission(
    p_driver_id UUID,
    p_flete_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_flete_price DECIMAL(10,2);
    v_category_id INT;
    v_commission_rate DECIMAL(10,2);
    v_commission_amount DECIMAL(10,2);
    v_current_balance DECIMAL(10,2);
    v_can_afford BOOLEAN;
BEGIN
    -- Obtener precio del viaje y categoría
    SELECT final_price, category_id INTO v_flete_price, v_category_id
    FROM fletes
    WHERE id = p_flete_id;
    
    -- Si no hay final_price (no completado o recién aceptando), usar estimated_price
    IF v_flete_price IS NULL OR v_flete_price = 0 THEN
        SELECT estimated_price INTO v_flete_price
        FROM fletes
        WHERE id = p_flete_id;
    END IF;

    -- Obtener tasa de comisión de la categoría
    SELECT commission_rate INTO v_commission_rate
    FROM vehicle_categories
    WHERE id = v_category_id;
    
    -- Default a 10% si no está seteado
    IF v_commission_rate IS NULL THEN
        v_commission_rate := 10.00;
    END IF;
    
    -- Calcular monto
    v_commission_amount := (v_flete_price * v_commission_rate) / 100.0;
    
    -- Obtener balance actual del chofer
    SELECT balance INTO v_current_balance
    FROM wallets
    WHERE driver_id = p_driver_id;
    
    -- Verificar si puede pagarlo
    v_can_afford := (COALESCE(v_current_balance, 0) >= v_commission_amount);
    
    RETURN jsonb_build_object(
        'flete_id', p_flete_id,
        'trip_value', v_flete_price,
        'commission_rate', v_commission_rate,
        'commission_amount', v_commission_amount,
        'current_balance', COALESCE(v_current_balance, 0),
        'can_afford', v_can_afford
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Función para cobrar comisión y aceptar viaje atómicamente
CREATE OR REPLACE FUNCTION charge_trip_commission(
    p_driver_id UUID,
    p_flete_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_calc JSONB;
    v_wallet_id UUID;
    v_commission_amount DECIMAL(10,2);
    v_commission_rate DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
    v_tx_id UUID;
BEGIN
    -- 1. Calcular comisión
    v_calc := calculate_trip_commission(p_driver_id, p_flete_id);
    
    IF NOT (v_calc->>'can_afford')::BOOLEAN THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Saldo insuficiente para tomar este viaje',
            'required', (v_calc->>'commission_amount')::DECIMAL,
            'balance', (v_calc->>'current_balance')::DECIMAL,
            'commission_rate', (v_calc->>'commission_rate')::DECIMAL
        );
    END IF;

    v_commission_amount := (v_calc->>'commission_amount')::DECIMAL;
    v_commission_rate := (v_calc->>'commission_rate')::DECIMAL;

    -- 2. Obtener wallet_id
    SELECT id INTO v_wallet_id FROM wallets WHERE driver_id = p_driver_id FOR UPDATE;
    
    IF v_wallet_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se encontró billetera para este chofer');
    END IF;

    -- 3. Descontar saldo usando la función existente update_wallet_balance
    -- p_amount debe ser negativo para descuento
    SELECT update_wallet_balance(
        v_wallet_id,
        -v_commission_amount,
        'commission',
        'Comisión por aceptar viaje #' || substring(p_flete_id::text, 1, 8),
        p_flete_id
    ) INTO v_tx_id;

    -- 4. Actualizar el viaje: asignar chofer, cambiar status y guardar info de comisión
    UPDATE fletes
    SET driver_id = p_driver_id,
        status = 'accepted',
        accepted_at = NOW(),
        commission_amount = v_commission_amount,
        commission_rate = v_commission_rate,
        updated_at = NOW()
    WHERE id = p_flete_id;

    -- 5. Obtener nuevo balance
    SELECT balance INTO v_new_balance FROM wallets WHERE id = v_wallet_id;

    -- 6. Logguear actividad
    PERFORM log_activity(
        p_driver_id,
        'trip_accepted',
        'flete',
        p_flete_id,
        jsonb_build_object(
            'commission_amount', v_commission_amount,
            'commission_rate', v_commission_rate,
            'transaction_id', v_tx_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'commission_amount', v_commission_amount,
        'commission_rate', v_commission_rate,
        'new_balance', v_new_balance,
        'transaction_id', v_tx_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Actualizar la vista admin_stats para que el total_revenue sea la suma de comisiones
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
    
    -- Vehículos pendientes
    (SELECT COUNT(*) FROM vehicles WHERE verification_status = 'pending') as pending_vehicles,
    
    -- Ingresos (Suma de comisiones cobradas por la plataforma)
    (SELECT COALESCE(SUM(commission_amount), 0) FROM fletes WHERE driver_id IS NOT NULL) as total_revenue;
