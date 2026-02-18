-- Script SQL para Panel Admin - Sistema de Reclamos y Moderación
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla de reclamos/problemas
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flete_id UUID REFERENCES fletes(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_type VARCHAR(20) NOT NULL, -- 'client', 'driver'
    category VARCHAR(50) NOT NULL, -- 'service', 'payment', 'behavior', 'safety', 'other'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    
    -- Admin que gestiona
    assigned_to UUID REFERENCES profiles(id),
    admin_notes TEXT,
    resolution TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- 2. Tabla de advertencias a usuarios
CREATE TABLE IF NOT EXISTS user_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    complaint_id UUID REFERENCES complaints(id), -- Relacionado con un reclamo
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de expulsiones/baneos
CREATE TABLE IF NOT EXISTS user_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    ban_type VARCHAR(20) DEFAULT 'temporary', -- 'temporary', 'permanent'
    
    -- Duración
    expires_at TIMESTAMPTZ,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Relacionado con reclamo o advertencias
    complaint_id UUID REFERENCES complaints(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    lifted_at TIMESTAMPTZ,
    lifted_by UUID REFERENCES profiles(id)
);

-- 4. Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'trip_created', 'trip_accepted', 'complaint_filed', etc.
    entity_type VARCHAR(50), -- 'flete', 'complaint', 'user', etc.
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_flete_id ON complaints(flete_id);

CREATE INDEX IF NOT EXISTS idx_user_warnings_user_id ON user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_created_at ON user_warnings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_is_active ON user_bans(is_active);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 6. Función para verificar si un usuario está baneado
CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_banned BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM user_bans
        WHERE user_id = p_user_id
        AND is_active = true
        AND (
            ban_type = 'permanent'
            OR (ban_type = 'temporary' AND expires_at > NOW())
        )
    ) INTO v_is_banned;
    
    RETURN v_is_banned;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para registrar actividad
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para actualizar updated_at en complaints
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_complaints_updated_at ON complaints;
CREATE TRIGGER trigger_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Trigger para registrar cuando se crea un reclamo
CREATE OR REPLACE FUNCTION log_complaint_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_activity(
        NEW.user_id,
        'complaint_created',
        'complaint',
        NEW.id,
        jsonb_build_object(
            'category', NEW.category,
            'title', NEW.title,
            'flete_id', NEW.flete_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_complaint_creation ON complaints;
CREATE TRIGGER trigger_log_complaint_creation
    AFTER INSERT ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION log_complaint_creation();

-- 10. Trigger para registrar cuando se banea un usuario
CREATE OR REPLACE FUNCTION log_user_ban()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_activity(
        NEW.admin_id,
        'user_banned',
        'user',
        NEW.user_id,
        jsonb_build_object(
            'ban_type', NEW.ban_type,
            'reason', NEW.reason,
            'expires_at', NEW.expires_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_user_ban ON user_bans;
CREATE TRIGGER trigger_log_user_ban
    AFTER INSERT ON user_bans
    FOR EACH ROW
    EXECUTE FUNCTION log_user_ban();

-- 11. Vista para estadísticas del admin
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
    
    -- Ingresos (suma de viajes completados)
    (SELECT COALESCE(SUM(estimated_price), 0) FROM fletes WHERE status = 'completed') as total_revenue;

-- 12. Comentarios para documentación
COMMENT ON TABLE complaints IS 'Reclamos y problemas reportados por usuarios';
COMMENT ON TABLE user_warnings IS 'Advertencias emitidas a usuarios por comportamiento inadecuado';
COMMENT ON TABLE user_bans IS 'Usuarios baneados temporal o permanentemente';
COMMENT ON TABLE activity_logs IS 'Registro de todas las acciones importantes en la plataforma';

COMMENT ON COLUMN complaints.status IS 'Estado: pending, in_progress, resolved, closed';
COMMENT ON COLUMN complaints.priority IS 'Prioridad: low, medium, high, urgent';
COMMENT ON COLUMN user_bans.ban_type IS 'Tipo: temporary (con expires_at), permanent';
COMMENT ON COLUMN activity_logs.action IS 'Acción realizada: trip_created, complaint_filed, user_banned, etc.';
