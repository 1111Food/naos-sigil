-- 06_fix_sigil_truncation.sql
-- Increase character limit for Sigil interaction logs

-- Update user_message and sigil_response to TEXT if they were limited
ALTER TABLE public.interaction_logs 
  ALTER COLUMN user_message TYPE TEXT,
  ALTER COLUMN sigil_response TYPE TEXT;

-- Ensure guardian_notes is also TEXT
ALTER TABLE public.profiles
  ALTER COLUMN guardian_notes TYPE TEXT;

COMMENT ON COLUMN public.interaction_logs.sigil_response IS 'Response from Sigil (Gemini), supports long mystical readings.';
