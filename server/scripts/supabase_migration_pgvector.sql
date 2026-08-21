-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create types
CREATE TYPE memory_type_enum AS ENUM ('memory', 'knowledge', 'state', 'evidence', 'history');
CREATE TYPE entity_type_enum AS ENUM ('user', 'relationship', 'project', 'team', 'goal', 'person');

-- Create naos_memory table
CREATE TABLE IF NOT EXISTS naos_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID,
    entity_type entity_type_enum DEFAULT 'user',
    memory_type memory_type_enum NOT NULL DEFAULT 'memory',
    module_source TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(768),
    importance SMALLINT DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    confidence REAL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
    superseded_by UUID REFERENCES naos_memory(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- HNSW index on embedding column
CREATE INDEX ON naos_memory USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Composite indexes
CREATE INDEX idx_naos_memory_user_active ON naos_memory(user_id, is_active);
CREATE INDEX idx_naos_memory_entity ON naos_memory(entity_id, entity_type);
CREATE INDEX idx_naos_memory_user_type ON naos_memory(user_id, memory_type);
CREATE INDEX idx_naos_memory_user_source ON naos_memory(user_id, module_source);

-- RPC function match_memory
CREATE OR REPLACE FUNCTION match_memory(
    query_embedding vector(768),
    match_user_id UUID,
    match_count INT DEFAULT 10,
    match_threshold FLOAT DEFAULT 0.7,
    filter_memory_type memory_type_enum DEFAULT NULL,
    filter_module_source TEXT DEFAULT NULL,
    filter_entity_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    entity_id UUID,
    entity_type entity_type_enum,
    memory_type memory_type_enum,
    module_source TEXT,
    content TEXT,
    metadata JSONB,
    importance SMALLINT,
    confidence REAL,
    superseded_by UUID,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.user_id,
        m.entity_id,
        m.entity_type,
        m.memory_type,
        m.module_source,
        m.content,
        m.metadata,
        m.importance,
        m.confidence,
        m.superseded_by,
        m.is_active,
        m.created_at,
        m.updated_at,
        m.expires_at,
        1 - (m.embedding <=> query_embedding) AS similarity
    FROM naos_memory m
    WHERE m.user_id = match_user_id
        AND m.is_active = true
        AND (filter_memory_type IS NULL OR m.memory_type = filter_memory_type)
        AND (filter_module_source IS NULL OR m.module_source = filter_module_source)
        AND (filter_entity_id IS NULL OR m.entity_id = filter_entity_id)
        AND 1 - (m.embedding <=> query_embedding) > match_threshold
    ORDER BY (1 - (m.embedding <=> query_embedding)) * (m.importance / 10.0) DESC
    LIMIT match_count;
END;
$$;

-- Create naos_memory_settings table
CREATE TABLE IF NOT EXISTS naos_memory_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_enabled BOOLEAN DEFAULT true,
    auto_save_chat BOOLEAN DEFAULT true,
    retention_days INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE naos_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE naos_memory_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own memories"
    ON naos_memory FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
    ON naos_memory_settings FOR ALL
    USING (auth.uid() = user_id);
