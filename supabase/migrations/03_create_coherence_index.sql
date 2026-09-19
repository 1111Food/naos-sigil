-- Migration: 03_create_coherence_index
-- Description: Foundational table for storing real-time user coherence states (Personal Intelligence Engine).

CREATE TABLE public.coherence_index (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    discipline_score FLOAT DEFAULT 50,
    energy_score FLOAT DEFAULT 50,
    clarity_score FLOAT DEFAULT 50,
    global_coherence FLOAT DEFAULT 50,
    current_streak INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for cross-user isolation
ALTER TABLE public.coherence_index ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own coherence" 
    ON public.coherence_index FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coherence" 
    ON public.coherence_index FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coherence" 
    ON public.coherence_index FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coherence" 
    ON public.coherence_index FOR DELETE 
    USING (auth.uid() = user_id);

COMMENT ON TABLE public.coherence_index IS 'Stores user coherence metrics and interaction streaks, providing the foundation for the Personal Intelligence engine.';
