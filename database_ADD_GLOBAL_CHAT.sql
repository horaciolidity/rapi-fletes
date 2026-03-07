-- CREATE GLOBAL MESSAGES TABLE
CREATE TABLE IF NOT EXISTS global_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sender_name TEXT,
    sender_role TEXT CHECK (sender_role IN ('client', 'driver', 'admin', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE global_messages ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Anyone can read global messages" ON global_messages;
CREATE POLICY "Anyone can read global messages" 
ON global_messages FOR SELECT 
TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can send global messages" ON global_messages;
CREATE POLICY "Anyone can send global messages" 
ON global_messages FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = sender_id);

-- INDEX FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_global_messages_created_at ON global_messages(created_at DESC);

-- COMMENT
COMMENT ON TABLE global_messages IS 'Chat comunitario para choferes y clientes de RapiFletes';
