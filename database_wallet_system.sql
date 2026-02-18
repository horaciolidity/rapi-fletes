-- Script SQL para sistema de billetera del chofer
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla de billeteras (una por chofer)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de transacciones (historial de movimientos)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'recharge', 'trip_earning', 'withdrawal', 'commission', 'refund'
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL, -- Balance después de la transacción
    description TEXT,
    reference_id UUID, -- ID del viaje o recarga relacionada
    metadata JSONB, -- Datos adicionales (ej: detalles de Mercado Pago)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de solicitudes de recarga (Mercado Pago)
CREATE TABLE IF NOT EXISTS recharge_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) DEFAULT 'mercadopago',
    
    -- Datos de Mercado Pago
    preference_id VARCHAR(255), -- ID de preferencia de MP
    payment_id VARCHAR(255), -- ID del pago en MP
    collection_id VARCHAR(255), -- ID de la colección en MP
    collection_status VARCHAR(50), -- approved, pending, rejected, etc.
    
    -- Estado de la recarga
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'approved', 'rejected', 'cancelled'
    
    -- Metadata
    mp_response JSONB, -- Respuesta completa de Mercado Pago
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ
);

-- 4. Tabla de retiros (para cuando el chofer quiera sacar dinero)
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    
    -- Datos bancarios del chofer
    bank_name VARCHAR(100),
    account_type VARCHAR(50), -- 'savings', 'checking'
    account_number VARCHAR(50),
    account_holder VARCHAR(200),
    
    -- Estado del retiro
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    
    -- Admin que procesó
    processed_by UUID REFERENCES profiles(id),
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 5. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_wallets_driver_id ON wallets(driver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recharge_requests_driver_id ON recharge_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_recharge_requests_status ON recharge_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_driver_id ON withdrawals(driver_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- 6. Función para crear billetera automáticamente cuando un usuario se vuelve chofer
CREATE OR REPLACE FUNCTION create_wallet_for_driver()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'driver' AND OLD.role != 'driver' THEN
        INSERT INTO wallets (driver_id, balance)
        VALUES (NEW.id, 0.00)
        ON CONFLICT (driver_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para crear billetera automáticamente
DROP TRIGGER IF EXISTS trigger_create_wallet_for_driver ON profiles;
CREATE TRIGGER trigger_create_wallet_for_driver
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_for_driver();

-- 8. Función para actualizar balance de billetera
CREATE OR REPLACE FUNCTION update_wallet_balance(
    p_wallet_id UUID,
    p_amount DECIMAL(10,2),
    p_type VARCHAR(50),
    p_description TEXT,
    p_reference_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_current_balance DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
    v_transaction_id UUID;
BEGIN
    -- Obtener balance actual
    SELECT balance INTO v_current_balance
    FROM wallets
    WHERE id = p_wallet_id
    FOR UPDATE; -- Lock para evitar race conditions
    
    -- Calcular nuevo balance
    v_new_balance := v_current_balance + p_amount;
    
    -- Verificar que el balance no sea negativo
    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Saldo insuficiente. Balance actual: %, Monto: %', v_current_balance, p_amount;
    END IF;
    
    -- Actualizar balance
    UPDATE wallets
    SET balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_wallet_id;
    
    -- Crear transacción
    INSERT INTO transactions (wallet_id, type, amount, balance_after, description, reference_id)
    VALUES (p_wallet_id, p_type, p_amount, v_new_balance, p_description, p_reference_id)
    RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Función para procesar recarga aprobada
CREATE OR REPLACE FUNCTION process_approved_recharge(
    p_recharge_id UUID,
    p_payment_id VARCHAR(255),
    p_mp_response JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_id UUID;
    v_amount DECIMAL(10,2);
    v_driver_id UUID;
BEGIN
    -- Obtener datos de la recarga
    SELECT wallet_id, amount, driver_id
    INTO v_wallet_id, v_amount, v_driver_id
    FROM recharge_requests
    WHERE id = p_recharge_id
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recarga no encontrada o ya procesada';
    END IF;
    
    -- Actualizar estado de la recarga
    UPDATE recharge_requests
    SET status = 'approved',
        payment_id = p_payment_id,
        collection_status = 'approved',
        mp_response = p_mp_response,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_recharge_id;
    
    -- Agregar fondos a la billetera
    PERFORM update_wallet_balance(
        v_wallet_id,
        v_amount,
        'recharge',
        'Recarga aprobada - MP: ' || p_payment_id,
        p_recharge_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Comentarios para documentación
COMMENT ON TABLE wallets IS 'Billeteras de los choferes con su saldo disponible';
COMMENT ON TABLE transactions IS 'Historial de todas las transacciones (recargas, ganancias, retiros, comisiones)';
COMMENT ON TABLE recharge_requests IS 'Solicitudes de recarga vía Mercado Pago';
COMMENT ON TABLE withdrawals IS 'Solicitudes de retiro de fondos por parte de los choferes';

COMMENT ON COLUMN wallets.balance IS 'Saldo disponible del chofer (siempre >= 0)';
COMMENT ON COLUMN transactions.type IS 'Tipo: recharge, trip_earning, withdrawal, commission, refund';
COMMENT ON COLUMN transactions.balance_after IS 'Balance de la billetera después de esta transacción';
COMMENT ON COLUMN recharge_requests.status IS 'Estado: pending, processing, approved, rejected, cancelled';
COMMENT ON COLUMN withdrawals.status IS 'Estado: pending, processing, completed, rejected';

-- 11. Crear billeteras para choferes existentes
INSERT INTO wallets (driver_id, balance)
SELECT id, 0.00
FROM profiles
WHERE role = 'driver'
ON CONFLICT (driver_id) DO NOTHING;
