import { supabase } from './lib/supabase';

async function run() {
    const { data } = await supabase.from('profiles').select('*').limit(1);
    console.log("Profile Columns:", Object.keys(data?.[0] || {}));
}
run();
