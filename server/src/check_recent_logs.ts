import { supabase } from './lib/supabase';
async function run() {
    const { data, error } = await supabase.from('interaction_logs').select('user_message, created_at, user_id').order('created_at', { ascending: false }).limit(5);
    console.log(JSON.stringify(data, null, 2));
}
run();
