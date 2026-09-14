-- Migration: 20260914000000_telegram_link_tokens
-- Description: Table to securely store and consume one-time Telegram link tokens (JTIs).

CREATE TABLE IF NOT EXISTS public.telegram_link_tokens (
    jti UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_telegram_link_tokens_expires ON public.telegram_link_tokens(expires_at);

-- RLS
ALTER TABLE public.telegram_link_tokens ENABLE ROW LEVEL SECURITY;

-- Solo el backend (service_role) administra esto, así que negamos todo a anon y authenticated
CREATE POLICY "Deny all access to anon" ON public.telegram_link_tokens FOR ALL TO anon USING (false);
CREATE POLICY "Deny all access to authenticated" ON public.telegram_link_tokens FOR ALL TO authenticated USING (false);
