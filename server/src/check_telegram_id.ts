import { supabase } from './lib/supabase';
async function run() {
    const { data, error } = await supabase.from('profiles').select('id, email, full_name, telegram_chat_id').eq('telegram_chat_id', '166709600');
    console.log(JSON.stringify(data, null, 2));
}
run();
