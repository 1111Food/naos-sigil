
-- 1. Ensure telegram_chat_id is UNIQUE
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_telegram_chat_id_key UNIQUE (telegram_chat_id);

-- 2. Atomic RPC for consuming the token
CREATE OR REPLACE FUNCTION public.consume_telegram_token(
    p_telegram_chat_id TEXT,
    p_token_hash TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS \$\$
DECLARE
    v_user_id UUID;
    v_plan_type TEXT;
BEGIN
    -- Strict Validation
    IF p_telegram_chat_id IS NULL OR trim(p_telegram_chat_id) = '' THEN
        RETURN FALSE;
    END IF;

    -- Note: The token is currently hashed with SHA-256 (64 hex characters)
    IF p_token_hash IS NULL OR NOT p_token_hash ~ '^[a-fA-F0-9]{64}$' THEN
        RETURN FALSE;
    END IF;

    -- Verify if token is valid and user is Premium, then consume in one atomic step
    UPDATE public.profiles
    SET 
        telegram_chat_id = p_telegram_chat_id,
        profile_data = profile_data - 'telegram_link'
    WHERE 
        (profile_data->'telegram_link'->>'token') = p_token_hash
        AND (profile_data->'telegram_link'->>'expires_at')::TIMESTAMPTZ > now()
        AND plan_type IN ('premium', 'premium_plus', 'admin')
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;

EXCEPTION WHEN unique_violation THEN
    -- If another user already has this telegram_chat_id, we fail securely
    RETURN FALSE;
END;
\$\$;

-- 3. Strict Permissions
REVOKE ALL ON FUNCTION public.consume_telegram_token(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_telegram_token(TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.consume_telegram_token(TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_telegram_token(TEXT, TEXT) TO service_role;

