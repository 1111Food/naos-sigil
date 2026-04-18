import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    console.error('⚠️ CRITICAL: Supabase configuration missing. DB features will fail.');
}

const keyToUse = config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY || 'placeholder-dont-crash';
const isServiceRole = !!config.SUPABASE_SERVICE_ROLE_KEY;

console.log(`🔌 Supabase Client Manifested. Role: ${isServiceRole ? 'SERVICE_ROLE (RLS Bypass)' : 'ANON (Subject to RLS)'}`);

export const supabase = createClient(
    config.SUPABASE_URL || 'https://placeholder-dont-crash.supabase.co',
    keyToUse
);
