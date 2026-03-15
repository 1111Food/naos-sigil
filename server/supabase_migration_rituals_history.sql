-- Migration: Create rituals_history table
-- FIFO limit (3) is handled in backend logic

CREATE TABLE IF NOT EXISTS public.rituals_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    intention TEXT NOT NULL,
    cards JSONB NOT NULL,
    engine TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rituals_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own rituals" ON public.rituals_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rituals" ON public.rituals_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rituals" ON public.rituals_history
    FOR DELETE USING (auth.uid() = user_id);
