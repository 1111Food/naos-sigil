import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

/**
 * ADMIN CLIENT
 * Used for backend operations that bypass RLS, like webhook processing.
 */
if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('⚠️ CRITICAL: Supabase ADMIN configuration missing. Webhooks WILL FAIL.');
}

export const supabaseAdmin = createClient(
    config.SUPABASE_URL || 'https://placeholder.dont-crash.supabase.co',
    config.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-dont-crash'
);
