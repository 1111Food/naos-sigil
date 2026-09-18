-- Migration: AI Economics and Deep Interpretation Persistence
-- Purpose: Control AI costs, prevent duplicate generations, cache interpretations per cycle
-- Generated: 2026-09-18

-- 1. Budget Overrides
CREATE TABLE public.user_ai_budgets (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    budget_usd numeric(10, 2) NOT NULL,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid -- Admin who changed it
);

-- RLS for user_ai_budgets
ALTER TABLE public.user_ai_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own budget" ON public.user_ai_budgets FOR SELECT USING (auth.uid() = user_id);
-- Admin policies omitted for brevity; backend uses SERVICE_ROLE for admin operations.

-- 2. AI Usage Ledger
CREATE TABLE public.ai_usage_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    usage_cycle_period text NOT NULL, -- e.g., '2026-09', or 'sub_sub_id_cycle_1'
    feature text NOT NULL, -- 'deep_interpretation', 'sigil_morning', 'oracle'
    provider text NOT NULL, -- 'gemini', 'elevenlabs'
    model text NOT NULL, -- 'gemini-2.5-pro'
    input_tokens integer DEFAULT 0,
    output_tokens integer DEFAULT 0,
    cached_tokens integer DEFAULT 0,
    estimated_cost_usd numeric(10, 6) DEFAULT 0.0,
    request_id text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_usage_ledger_cycle ON public.ai_usage_ledger(user_id, usage_cycle_period);

ALTER TABLE public.ai_usage_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own ledger" ON public.ai_usage_ledger FOR SELECT USING (auth.uid() = user_id);

-- 3. Deep Interpretations Persistence
CREATE TABLE public.deep_interpretations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interpretation_key text NOT NULL, -- e.g., 'moon_house_1'
    target text NOT NULL, -- e.g., 'astrology'
    locale text NOT NULL, -- 'es' or 'en'
    source_fingerprint text NOT NULL, -- SHA256 of canonical dependencies
    methodology_version text NOT NULL, -- e.g., 'v1_deep'
    usage_cycle_period text NOT NULL,
    status text NOT NULL DEFAULT 'READY', -- 'GENERATING', 'READY', 'FAILED'
    content text,
    model_metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Concurrency / Duplicate Prevention Constraint
-- A user can only have ONE successful/generating interpretation for a specific key + fingerprint + methodology + cycle
CREATE UNIQUE INDEX idx_unique_deep_interpretation 
ON public.deep_interpretations(user_id, interpretation_key, source_fingerprint, locale, methodology_version, usage_cycle_period);

ALTER TABLE public.deep_interpretations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own interpretations" ON public.deep_interpretations FOR SELECT USING (auth.uid() = user_id);
-- Insert/Update handled securely by server
