-- NAOS DATABASE FIX - Protocol 21 Local Date & Atomicity
-- Description: Adds a local_date column to protocol_daily_logs to prevent multiple same-day check-ins based on local timezone, and enforces a unique constraint.

-- 1. Add local_date to protocol_daily_logs
ALTER TABLE public.protocol_daily_logs
ADD COLUMN IF NOT EXISTS local_date DATE;

-- 2. Backfill existing records with their completed_at timestamp cast to date
UPDATE public.protocol_daily_logs
SET local_date = (completed_at AT TIME ZONE 'UTC')::DATE
WHERE local_date IS NULL;

-- 3. Make local_date required and add unique constraint
-- To avoid issues with old duplicate data, we first remove exact duplicates (keeping the latest)
DELETE FROM public.protocol_daily_logs a
USING public.protocol_daily_logs b
WHERE a.protocol_id = b.protocol_id 
  AND a.local_date = b.local_date 
  AND a.completed_at < b.completed_at;

ALTER TABLE public.protocol_daily_logs
ALTER COLUMN local_date SET NOT NULL;

-- 4. Create Unique Constraint
ALTER TABLE public.protocol_daily_logs
DROP CONSTRAINT IF EXISTS protocol_daily_logs_protocol_id_local_date_key;

ALTER TABLE public.protocol_daily_logs
ADD CONSTRAINT protocol_daily_logs_protocol_id_local_date_key UNIQUE (protocol_id, local_date);

-- 5. RPC for Atomic Seal Day
CREATE OR REPLACE FUNCTION seal_protocol_day(
    p_protocol_id UUID,
    p_day_number INT,
    p_local_date DATE,
    p_notes TEXT,
    p_completed_at TIMESTAMPTZ,
    p_is_21_milestone BOOLEAN,
    p_is_final_completion BOOLEAN
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_protocol record;
BEGIN
    -- Insert the log (will fail if local_date already exists due to unique constraint)
    INSERT INTO public.protocol_daily_logs (protocol_id, day_number, is_completed, completed_at, notes, local_date)
    VALUES (p_protocol_id, p_day_number, true, p_completed_at, p_notes, p_local_date);

    -- Update the user_protocols
    IF p_is_21_milestone THEN
        UPDATE public.user_protocols
        SET status = 'awaiting_evolution', updated_at = NOW()
        WHERE id = p_protocol_id
        RETURNING * INTO v_updated_protocol;
    ELSIF p_is_final_completion THEN
        UPDATE public.user_protocols
        SET status = 'completed', end_date = NOW(), updated_at = NOW()
        WHERE id = p_protocol_id
        RETURNING * INTO v_updated_protocol;

        -- Update the original intention
        UPDATE public.protocols
        SET status = 'completed'
        WHERE user_id = v_updated_protocol.user_id AND status = 'active';
    ELSE
        UPDATE public.user_protocols
        SET current_day = current_day + 1, updated_at = NOW()
        WHERE id = p_protocol_id
        RETURNING * INTO v_updated_protocol;
    END IF;

    RETURN to_jsonb(v_updated_protocol);
END;
$$;
