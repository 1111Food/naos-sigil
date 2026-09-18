-- Migration: Separate authorization role from commercial billing plan
-- Purpose: Ensure billing upgrades cannot accidentally grant admin rights
-- Generated: 2026-09-18

ALTER TABLE public.profiles
ADD COLUMN system_role text DEFAULT 'user';

-- Perform one-time backfill based on current plan_type
UPDATE public.profiles
SET system_role = 'admin'
WHERE plan_type = 'admin';

-- Explicitly protect the Founder
UPDATE public.profiles
SET system_role = 'owner'
WHERE email = 'luisalfredoherreramendez@gmail.com';
