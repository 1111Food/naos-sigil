-- Migration: 05_telegram_linking
-- Adds telegram_chat_id to profiles and creates a secure RPC for the Telegram bot to link accounts by email.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(100);

-- Create an index for quick lookups when sending proactive messages
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON public.profiles(telegram_chat_id);

-- ADDED: Create an index for quick lookups by email in profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Secure RPC function to link Telegram ID by searching public.profiles email
CREATE OR REPLACE FUNCTION public.link_telegram_by_email(target_email TEXT, telegram_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Allows the function to bypass RLS
AS $$
DECLARE
    found_user_id UUID;
BEGIN
    -- 1. Try to find the user ID in the public.profiles table (source of truth for our app's identified email)
    SELECT p.id INTO found_user_id
    FROM public.profiles p
    WHERE LOWER(p.email) = LOWER(target_email)
    LIMIT 1;

    -- 2. Fallback: Search auth.users (if for some reason it's not in profiles yet but is in auth)
    IF found_user_id IS NULL THEN
        SELECT au.id INTO found_user_id
        FROM auth.users au
        WHERE LOWER(au.email) = LOWER(target_email)
        LIMIT 1;
    END IF;

    -- 3. If found, update their profile(s) with the Telegram Chat ID
    IF found_user_id IS NOT NULL THEN
        UPDATE public.profiles
        SET telegram_chat_id = telegram_id
        WHERE LOWER(email) = LOWER(target_email);
        
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;

-- Grant execution to anon (so the bot can call it via service role / anon if allowed)
GRANT EXECUTE ON FUNCTION public.link_telegram_by_email(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.link_telegram_by_email(TEXT, TEXT) TO authenticated;
