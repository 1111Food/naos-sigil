-- Create sigil_daily_transmissions table matching exact production drift
CREATE TABLE IF NOT EXISTS sigil_daily_transmissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    moment TEXT NOT NULL,
    transmission TEXT NOT NULL,
    was_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotency protection required by backend runtime
-- Prevents duplicate MORNING or EVENING per user per date
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'sigil_daily_transmissions_user_date_moment_idx'
        AND n.nspname = 'public'
    ) THEN
        CREATE UNIQUE INDEX sigil_daily_transmissions_user_date_moment_idx 
        ON sigil_daily_transmissions (user_id, date, moment);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE sigil_daily_transmissions ENABLE ROW LEVEL SECURITY;

-- Cross-User RLS Isolation (User A cannot read/mutate User B)
-- Service Role bypasses RLS implicitly
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sigil_daily_transmissions' AND policyname = 'Users can view their own daily transmissions'
    ) THEN
        CREATE POLICY "Users can view their own daily transmissions"
        ON sigil_daily_transmissions
        FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sigil_daily_transmissions' AND policyname = 'Users can insert their own daily transmissions'
    ) THEN
        CREATE POLICY "Users can insert their own daily transmissions"
        ON sigil_daily_transmissions
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sigil_daily_transmissions' AND policyname = 'Users can update their own daily transmissions'
    ) THEN
        CREATE POLICY "Users can update their own daily transmissions"
        ON sigil_daily_transmissions
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
