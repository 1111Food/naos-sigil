-- v10.1: Fix Chat Truncation (Sigil & User logs)
-- This script increases the character limit for interaction logs from ~255 to infinite.

-- 1. Alter interaction_logs table
ALTER TABLE public.interaction_logs
ALTER COLUMN sigil_response TYPE TEXT,
ALTER COLUMN user_message TYPE TEXT;

-- 2. Verify any other related tables (optional safety check)
-- No other obvious 255-limited tables for chat history detected.

COMMENT ON COLUMN public.interaction_logs.sigil_response IS 'Response from the oracle, changed to TEXT to avoid 255-char truncation.';
COMMENT ON COLUMN public.interaction_logs.user_message IS 'User message, changed to TEXT to avoid truncation.';
