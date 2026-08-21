-- =============================================================================
-- NAOS — supabase_migration_protocols_v4.sql
-- Protocol 21/90: Constraint Fix for 90-Day Cycle
-- =============================================================================
--
-- Context:
--   Protocol 21/90 allows users to evolve their initial 21-day protocol into
--   a 90-day protocol (Cycle II). Two CHECK constraints that were created
--   during the original Protocol 21 implementation limit current_day and
--   day_number to a maximum of 21. These constraints block the 90-day cycle.
--
-- Flow Analysis (verified via static trace + live DB test 2026-08-21):
--
--   Protocol 21 (target_days = 21):
--     Day 1  seal  → current_day written as 2
--     Day 20 seal  → current_day written as 21
--     Day 21 seal  → status = awaiting_evolution (current_day NOT incremented, stays 21)
--                    day_number 21 log IS written
--     evolveProtocol → current_day SET to 22 directly (hardcoded in service.ts)
--
--   Protocol 90 (target_days = 90, after evolution):
--     Day 22 seal  → current_day written as 23
--     ...
--     Day 89 seal  → current_day written as 90  ← MAX current_day ever written
--     Day 90 seal  → day_number 90 log IS written ← MAX day_number ever written
--                    status = completed
--                    current_day NOT written (status branch, not progression branch)
--
-- Conclusion:
--   MAX current_day ever written to DB = 90  (from seal of day 89: 89+1=90)
--   MAX day_number ever written to DB  = 90  (the day 90 log itself)
--   Day 91 is IMPOSSIBLE: target_days is always 21 or 90, never 91.
--
-- Existing Data Validation (confirmed 2026-08-21):
--   - 0 rows in user_protocols with current_day > 21
--   - 0 rows in protocol_daily_logs with day_number > 21
--   - 18 total user_protocols rows
--   - 44 total protocol_daily_logs rows
--   → No existing data is incompatible with the new constraints.
--
-- Reproducibility:
--   This migration is safe to run multiple times (DROP IF EXISTS before ADD).
-- =============================================================================

-- 1. user_protocols: expand current_day constraint from 21 to 90
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_protocols
    DROP CONSTRAINT IF EXISTS user_protocols_current_day_check;

ALTER TABLE public.user_protocols
    ADD CONSTRAINT user_protocols_current_day_check
    CHECK (current_day >= 1 AND current_day <= 90);

-- 2. protocol_daily_logs: expand day_number constraint from 21 to 90
-- ---------------------------------------------------------------------------
ALTER TABLE public.protocol_daily_logs
    DROP CONSTRAINT IF EXISTS protocol_daily_logs_day_number_check;

ALTER TABLE public.protocol_daily_logs
    ADD CONSTRAINT protocol_daily_logs_day_number_check
    CHECK (day_number >= 1 AND day_number <= 90);

-- =============================================================================
-- VERIFICATION QUERIES (run after migration to confirm)
-- =============================================================================
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM   pg_constraint
-- WHERE  conrelid = 'public.user_protocols'::regclass
--   AND  contype  = 'c'
--   AND  conname LIKE '%current_day%';
--
-- Expected result:
--   user_protocols_current_day_check | CHECK ((current_day >= 1) AND (current_day <= 90))
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM   pg_constraint
-- WHERE  conrelid = 'public.protocol_daily_logs'::regclass
--   AND  contype  = 'c'
--   AND  conname LIKE '%day_number%';
--
-- Expected result:
--   protocol_daily_logs_day_number_check | CHECK ((day_number >= 1) AND (day_number <= 90))
-- =============================================================================
