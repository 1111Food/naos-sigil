import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

async function purgeAll() {
    console.log("🔥 Starting NAOS Deep Purge...");

    const tables = [
        'synastry_history',
        'interaction_logs',
        'meditation_sessions',
        'coherence_history',
        'coherence_tunings',
        'intentions',
        'user_evolution',
        'coherence_index'
    ];

    for (const table of tables) {
        console.log(`🗑️ Purging ${table}...`);
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) console.error(`❌ Error purging ${table}:`, error.message);
        else console.log(`✅ ${table} cleared.`);
    }

    console.log("👤 Cleaning profiles...");
    // We delete all profiles to let the user start truly from scratch
    const { error: profileError } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (profileError) {
        console.error("❌ Error cleaning profiles:", profileError.message);
    } else {
        console.log("✅ Profiles cleared.");
    }

    console.log("✨ Deep Purge Complete. The slate is clean.");
}

purgeAll();
