
-- PHASE 2A: RLS HARDENING

-- 1. Revoke dangerous global grants from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Note: Anon needs access to auth endpoints, but Supabase handles that via GoTrue.
-- For standard REST API, anon should generally have no access unless explicitly required.
-- However, we will grant SELECT/INSERT/UPDATE to authenticated, restricted by RLS.
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- 2. Drop the catastrophic USING (true) policies
DROP POLICY IF EXISTS "Allow anon to update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon to sync coherence" ON public.coherence_index;

-- 3. Create strict SELECT-only policies for profiles (Backend handles mutability)
DO $do BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    END IF;
END $do;

-- 4. Create strict SELECT-only policies for coherence_index
DO $do BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own coherence') THEN
        CREATE POLICY "Users can view their own coherence" ON public.coherence_index
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $do;

