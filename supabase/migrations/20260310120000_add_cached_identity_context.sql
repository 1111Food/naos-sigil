-- Migration: Add cached_identity_context to profiles table to reduce backend calculations

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cached_identity_context TEXT;

-- Create an index to quickly check if a profile needs calculation (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_profiles_cached_context ON profiles(cached_identity_context) WHERE cached_identity_context IS NULL;
