import { supabase } from './lib/supabase';
async function run() {
    const { data, error } = await supabase.from('profiles').select('id, full_name, telegram_chat_id, updated_at').order('updated_at', { ascending: false }).limit(10);
    console.log(JSON.stringify(data, null, 2));
}
run();
