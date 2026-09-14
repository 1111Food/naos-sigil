-- Point 4B1: Restore Long-Term Memory (RAG) Architecture
-- Ensure pgvector extension exists safely
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create canonical naos_memory table
CREATE TABLE IF NOT EXISTS public.naos_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    entity_id TEXT,
    entity_type TEXT,
    memory_type TEXT,
    module_source TEXT,
    importance NUMERIC DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.naos_memory ENABLE ROW LEVEL SECURITY;

-- Grants for service_role and authenticated users
GRANT ALL ON TABLE public.naos_memory TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.naos_memory TO authenticated;

-- RLS Policies ensuring absolute user isolation
CREATE POLICY "Users can manage their own memories"
    ON public.naos_memory
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create match_memory RPC with strict user scoping
CREATE OR REPLACE FUNCTION public.match_memory(
    query_embedding vector(768),
    match_user_id uuid,
    match_count int DEFAULT 10,
    match_threshold float DEFAULT 0.5,
    filter_memory_type text DEFAULT NULL,
    filter_module_source text DEFAULT NULL,
    filter_entity_id text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    content text,
    entity_id text,
    entity_type text,
    memory_type text,
    module_source text,
    importance numeric,
    created_at timestamp with time zone,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS 
BEGIN
    RETURN QUERY
    SELECT
        nm.id,
        nm.user_id,
        nm.content,
        nm.entity_id,
        nm.entity_type,
        nm.memory_type,
        nm.module_source,
        nm.importance,
        nm.created_at,
        1 - (nm.embedding <=> query_embedding) AS similarity
    FROM public.naos_memory nm
    WHERE nm.user_id = match_user_id
        AND (filter_memory_type IS NULL OR nm.memory_type = filter_memory_type)
        AND (filter_module_source IS NULL OR nm.module_source = filter_module_source)
        AND (filter_entity_id IS NULL OR nm.entity_id = filter_entity_id)
        AND 1 - (nm.embedding <=> query_embedding) > match_threshold
    ORDER BY nm.embedding <=> query_embedding
    LIMIT match_count;
END;
;
