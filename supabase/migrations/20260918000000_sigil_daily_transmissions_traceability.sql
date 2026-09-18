-- Migration: Add Traceability Fields to Sigil Daily Transmissions
-- Purpose: Support incident tracking for Telegram transmissions and proactive messages
-- Generated: 2026-09-18

ALTER TABLE public.sigil_daily_transmissions
ADD COLUMN timezone_iana text,
ADD COLUMN canonical_daily_context_version text DEFAULT 'v2_daily_context',
ADD COLUMN scheduler_runtime_version text DEFAULT 'v2',
ADD COLUMN archetype_used text,
ADD COLUMN delivery_channel text DEFAULT 'telegram',
ADD COLUMN delivery_status text DEFAULT 'delivered',
ADD COLUMN build_commit text;

-- Optional: Create an index for faster incident lookup by date and channel
CREATE INDEX IF NOT EXISTS idx_sigil_transmissions_delivery 
ON public.sigil_daily_transmissions (delivery_channel, delivery_status, date);
