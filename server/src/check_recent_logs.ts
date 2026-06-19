import { supabase } from './lib/supabase';

async function checkRecentLogs() {
    const { data, error } = await supabase
        .from('interaction_logs')
        .select('user_message, sigil_response, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

checkRecentLogs();
