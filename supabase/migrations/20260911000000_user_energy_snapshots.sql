-- Micro Time Map Persistence
-- Server-only access through Service Role

CREATE TABLE IF NOT EXISTS public.user_energy_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    snapshot_date DATE NOT NULL,
    language TEXT NOT NULL,
    payload JSONB NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (user_id, snapshot_date, language)
);

ALTER TABLE public.user_energy_snapshots
ENABLE ROW LEVEL SECURITY;

-- No client policies intentionally.
-- Read/write access happens only through the backend using Service Role.
