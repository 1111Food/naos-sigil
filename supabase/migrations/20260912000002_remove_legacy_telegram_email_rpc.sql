
-- Migration: 20260912000002_remove_legacy_telegram_email_rpc
-- Removes the legacy and vulnerable email-based telegram linking RPC.

REVOKE ALL
ON FUNCTION public.link_telegram_by_email(TEXT, TEXT)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.link_telegram_by_email(TEXT, TEXT)
FROM anon;

REVOKE ALL
ON FUNCTION public.link_telegram_by_email(TEXT, TEXT)
FROM authenticated;

DROP FUNCTION IF EXISTS public.link_telegram_by_email(TEXT, TEXT);

