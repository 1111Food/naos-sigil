-- NAOS DATABASE FIX v3.0 - Protocolo 21 RLS Policies
-- This script safely enables and configures Row Level Security (RLS) for the daily logs table.

-- 1. Ensure RLS is enabled on protocol_daily_logs
ALTER TABLE public.protocol_daily_logs ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can see their own daily logs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own protocol logs') THEN
        CREATE POLICY "Users can view their own protocol logs" ON public.protocol_daily_logs
        FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.user_protocols up
                WHERE up.id = protocol_daily_logs.protocol_id
                AND up.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 3. Policy: Users can insert their own daily logs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own protocol logs') THEN
        CREATE POLICY "Users can insert their own protocol logs" ON public.protocol_daily_logs
        FOR INSERT 
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.user_protocols up
                WHERE up.id = protocol_daily_logs.protocol_id
                AND up.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 4. Policy: Users can update their own daily logs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own protocol logs') THEN
        CREATE POLICY "Users can update their own protocol logs" ON public.protocol_daily_logs
        FOR UPDATE 
        USING (
            EXISTS (
                SELECT 1 FROM public.user_protocols up
                WHERE up.id = protocol_daily_logs.protocol_id
                AND up.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 5. Explicitly grant permissions to anon (since Supabase queries are routed through the REST API)
GRANT ALL ON TABLE public.protocol_daily_logs TO anon;
GRANT ALL ON TABLE public.protocol_daily_logs TO authenticated;

SELECT 'NAOS Protocolo 21 RLS Fix Applied' as status;
