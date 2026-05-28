import { supabase } from './lib/supabase';
async function run() {
    const { data, error } = await supabase.from('profiles').select('id, email, full_name, oracle_time').ilike('full_name', '%Luis%');
    console.log(JSON.stringify(data, null, 2));
}
run();
