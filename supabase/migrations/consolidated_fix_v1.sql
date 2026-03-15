-- NAOS CONSOLIDATED DATABASE FIX v1.0
-- This script synchronizes the schema and fixes RLS issues.

-- 1. Create missing coherence_tunings table
CREATE TABLE IF NOT EXISTS public.coherence_tunings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aspect VARCHAR(50) NOT NULL,
    cron_schedule VARCHAR(100) NOT NULL,
    module_type VARCHAR(50) DEFAULT 'protocol21',
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT coherence_tunings_user_module_aspect_key UNIQUE (user_id, module_type, aspect)
);

-- Enable RLS and add basic policies
ALTER TABLE public.coherence_tunings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can manage their own tunings') THEN
        CREATE POLICY "Users can manage their own tunings" ON public.coherence_tunings
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Fix Sigil Truncation (Text columns)
ALTER TABLE public.interaction_logs 
ALTER COLUMN user_message TYPE TEXT,
ALTER COLUMN sigil_response TYPE TEXT;

ALTER TABLE public.profiles 
ALTER COLUMN guardian_notes TYPE TEXT;

-- 3. Add Missing Telegram Column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(100);

-- 4. RLS Relaxing for Backend (Anon role)
-- The backend currently uses the 'anon' key. To allow it to write logs and update coherence
-- without a logged-in user context in all scenarios, we grant these specific permissions.
-- WARNING: This allows anyone with the anon key to insert. In production, use SERVICE_ROLE_KEY.

-- Allow anon to insert logs (for Sigil memory)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow anon to insert logs') THEN
        CREATE POLICY "Allow anon to insert logs" ON public.interaction_logs
        FOR INSERT WITH CHECK (true);
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

-- 5. Fix coherence_index Table Schema (if missing columns)
ALTER TABLE public.coherence_index 
ADD COLUMN IF NOT EXISTS discipline_score FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS energy_score FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS clarity_score FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS global_coherence FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Grant execute to anon for existing functions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Verification Message
SELECT 'NAOS System Synchronized' as status;
