import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function checkDB() {
    console.log("--- PROFILES ---");
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, telegram_chat_id');
    console.log(JSON.stringify(profiles, null, 2));

    console.log("\n--- SYNASTRY HISTORY ---");
    const { data: synastry } = await supabase.from('synastry_history').select('id, user_id, partner_name');
    console.log(`Count: ${synastry?.length || 0}`);

    console.log("\n--- COHERENCE HISTORY ---");
    const { data: coh } = await supabase.from('coherence_history').select('id, user_id');
    console.log(`Count: ${coh?.length || 0}`);

    console.log("\n--- INTERACTION LOGS ---");
    const { data: logs } = await supabase.from('interaction_logs').select('id, user_id');
    console.log(`Count: ${logs?.length || 0}`);
}

checkDB();
