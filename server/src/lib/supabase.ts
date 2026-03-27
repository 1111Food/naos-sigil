import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    console.error('⚠️ CRITICAL: Supabase configuration missing. DB features will fail.');
}

export const supabase = createClient(
    config.SUPABASE_URL || 'https://placeholder-dont-crash.supabase.co',
    config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY || 'placeholder-dont-crash'
);
