-- Migration: 04_coherence_tunings
-- Description: Table for storing user proactive habit preferences (tuning) for the MCP and Agent Loop.

CREATE TABLE public.coherence_tunings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aspect VARCHAR(50) NOT NULL, -- e.g., 'fuego', 'agua', 'protocolo21', 'oraculo'
    cron_schedule VARCHAR(100) NOT NULL, -- Flexible formatting, could be a cron string or semantic like 'every_day_at_8am'
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries from the MCP Oráculo
CREATE INDEX idx_coherence_tunings_user_id ON public.coherence_tunings(user_id);
CREATE INDEX idx_coherence_tunings_active ON public.coherence_tunings(is_active);

-- Enable RLS
ALTER TABLE public.coherence_tunings ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own tunings" 
    ON public.coherence_tunings FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tunings" 
    ON public.coherence_tunings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tunings" 
    ON public.coherence_tunings FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tunings" 
    ON public.coherence_tunings FOR DELETE 
    USING (auth.uid() = user_id);

-- Optional: Add a comment to the table
COMMENT ON TABLE public.coherence_tunings IS 'Stores user preferences for proactive, non-invasive mystical suggestions (habits) driven by the Sigil Agent Loop.';
