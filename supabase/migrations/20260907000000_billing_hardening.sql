-- NAOS Billing Hardening Migration

-- 1. Add Neutral Payment Fields (Additive only, preserving stripe_* for rollback)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT, -- 'active', 'past_due', 'canceled', etc.
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- 2. Backfill existing data
UPDATE profiles 
SET payment_provider = 'stripe',
    provider_customer_id = stripe_customer_id,
    provider_subscription_id = stripe_subscription_id,
    subscription_status = CASE 
        WHEN plan_type IN ('premium', 'premium_plus') THEN 'active'
        ELSE 'free'
    END
WHERE stripe_customer_id IS NOT NULL;
