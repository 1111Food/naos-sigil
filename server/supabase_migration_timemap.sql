CREATE TABLE IF NOT EXISTS public.user_time_maps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    language VARCHAR(2) NOT NULL DEFAULT 'es',
    annual_view JSONB NOT NULL,
    quarters JSONB NOT NULL,
    months JSONB NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint so each user only has one active map per language
CREATE UNIQUE INDEX idx_user_time_maps_user_lang ON public.user_time_maps(user_id, language);

-- Add RLS Policies
ALTER TABLE public.user_time_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own time maps" 
    ON public.user_time_maps FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time maps" 
    ON public.user_time_maps FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time maps" 
    ON public.user_time_maps FOR UPDATE 
    USING (auth.uid() = user_id);
