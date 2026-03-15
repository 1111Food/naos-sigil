-- NAOS CONSOLIDATED DATABASE FIX v2.0
-- This script handles missing columns gracefully and synchronizes the schema.

-- 1. Create missing coherence_tunings table
CREATE TABLE IF NOT EXISTS public.coherence_tunings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aspect TEXT NOT NULL, -- 'discipline', 'energy', 'clarity', 'global'
    module_type TEXT DEFAULT 'protocol21', -- 'protocol21', 'elemental_lab', etc.
    cron_schedule TEXT DEFAULT '0 9 * * *', -- Default 9 AM
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, aspect, module_type)
);

-- 2. Fix interaction_logs Table Schema
-- Add missing columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interaction_logs' AND column_name='user_message') THEN
        ALTER TABLE public.interaction_logs ADD COLUMN user_message TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='interaction_logs' AND column_name='sigil_response') THEN
        ALTER TABLE public.interaction_logs ADD COLUMN sigil_response TEXT;
    END IF;
END $$;

-- Ensure they are TEXT (in case they existed as VARCHAR)
ALTER TABLE public.interaction_logs 
ALTER COLUMN user_message TYPE TEXT,
ALTER COLUMN sigil_response TYPE TEXT;

-- 3. Fix meditation_sessions Table Schema
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meditation_sessions' AND column_name='type') THEN
        ALTER TABLE public.meditation_sessions ADD COLUMN type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meditation_sessions' AND column_name='completed_at') THEN
        ALTER TABLE public.meditation_sessions ADD COLUMN completed_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 4. Fix profiles Table Schema
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='guardian_notes') THEN
        ALTER TABLE public.profiles ADD COLUMN guardian_notes JSONB;
    END IF;
END $$;

ALTER TABLE public.profiles ALTER COLUMN guardian_notes TYPE JSONB USING guardian_notes::JSONB;

-- 5. Enable/Fix RLS Policies
ALTER TABLE public.coherence_tunings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coherence_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_logs ENABLE ROW LEVEL SECURITY;

-- Coherence Tunings Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own tunings') THEN
        CREATE POLICY "Users can view their own tunings" ON public.coherence_tunings FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own tunings') THEN
        CREATE POLICY "Users can insert their own tunings" ON public.coherence_tunings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own tunings') THEN
        CREATE POLICY "Users can update their own tunings" ON public.coherence_tunings FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Allow anon to update coherence (for Agent Loop)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow anon to sync coherence') THEN
        CREATE POLICY "Allow anon to sync coherence" ON public.coherence_index
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Allow anon to update profiles (for onboarding/cold read)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow anon to update profiles') THEN
        CREATE POLICY "Allow anon to update profiles" ON public.profiles
        FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 6. Fix coherence_index Table Schema (if missing columns)
ALTER TABLE public.coherence_index
ADD COLUMN IF NOT EXISTS discipline_score FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS energy_score FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS clarity_score FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS global_coherence FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ DEFAULT NOW();

-- 7. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Verification Message
SELECT 'NAOS System Synchronized v2.0' as status;
