-- Create daily_cosmic_states table to cache global transits
CREATE TABLE IF NOT EXISTS public.daily_cosmic_states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date_utc DATE NOT NULL UNIQUE,
    astrology_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    numerology_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    mayan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    chinese_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alter daily_readings to add structured fields for Frecuencia del Día
ALTER TABLE public.daily_readings
ADD COLUMN IF NOT EXISTS reading_data JSONB,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS energy_score INTEGER;

-- Enable RLS on daily_cosmic_states
ALTER TABLE public.daily_cosmic_states ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to authenticated users
CREATE POLICY "Enable read access for all users" ON public.daily_cosmic_states
    FOR SELECT USING (true);

-- Create policy to allow service role to insert/update
CREATE POLICY "Enable insert/update for service role only" ON public.daily_cosmic_states
    FOR ALL USING (auth.role() = 'service_role');
