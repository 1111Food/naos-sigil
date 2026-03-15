-- Migration: 07_create_rituals_history
-- Description: Table for storing Tarot reading history (Rituals).

CREATE TABLE IF NOT EXISTS public.rituals_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    intention TEXT NOT NULL,
    cards JSONB NOT NULL,
    engine VARCHAR(50) NOT NULL, -- 'ARCANOS' | 'ARQUETIPOS'
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_rituals_history_user_id ON public.rituals_history(user_id);

-- Enable RLS
ALTER TABLE public.rituals_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can select their own rituals" 
    ON public.rituals_history
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rituals" 
    ON public.rituals_history
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rituals" 
    ON public.rituals_history
    FOR DELETE 
    USING (auth.uid() = user_id);
