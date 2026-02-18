-- Políticas de RLS para el sistema de billetera
-- Ejecutar en el SQL Editor de Supabase

-- Habilitar RLS en las tablas
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para WALLETS
DROP POLICY IF EXISTS "Choferes pueden ver su propia billetera" ON wallets;
CREATE POLICY "Choferes pueden ver su propia billetera" 
ON wallets FOR SELECT 
USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Choferes pueden crear su propia billetera" ON wallets;
CREATE POLICY "Choferes pueden crear su propia billetera" 
ON wallets FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Admins pueden ver todas las billeteras" ON wallets;
CREATE POLICY "Admins pueden ver todas las billeteras" 
ON wallets FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Políticas para TRANSACTIONS
DROP POLICY IF EXISTS "Choferes pueden ver sus transacciones" ON transactions;
CREATE POLICY "Choferes pueden ver sus transacciones" 
ON transactions FOR SELECT 
USING (
  wallet_id IN (
    SELECT id FROM wallets WHERE driver_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins pueden ver todas las transacciones" ON transactions;
CREATE POLICY "Admins pueden ver todas las transacciones" 
ON transactions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Políticas para RECHARGE_REQUESTS
DROP POLICY IF EXISTS "Choferes pueden ver sus solicitudes de recarga" ON recharge_requests;
CREATE POLICY "Choferes pueden ver sus solicitudes de recarga" 
ON recharge_requests FOR SELECT 
USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Choferes pueden crear sus propias solicitudes de recarga" ON recharge_requests;
CREATE POLICY "Choferes pueden crear sus propias solicitudes de recarga" 
ON recharge_requests FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Choferes pueden actualizar sus propias solicitudes de recarga" ON recharge_requests;
CREATE POLICY "Choferes pueden actualizar sus propias solicitudes de recarga" 
ON recharge_requests FOR UPDATE 
USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Admins pueden ver todas las solicitudes de recarga" ON recharge_requests;
CREATE POLICY "Admins pueden ver todas las solicitudes de recarga" 
ON recharge_requests FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Políticas para WITHDRAWALS
DROP POLICY IF EXISTS "Choferes pueden ver sus retiros" ON withdrawals;
CREATE POLICY "Choferes pueden ver sus retiros" 
ON withdrawals FOR SELECT 
USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Choferes pueden solicitar retiros" ON withdrawals;
CREATE POLICY "Choferes pueden solicitar retiros" 
ON withdrawals FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Admins pueden gestionar retiros" ON withdrawals;
CREATE POLICY "Admins pueden gestionar retiros" 
ON withdrawals FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
