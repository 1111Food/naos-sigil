import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: 'server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: user, error: uErr } = await supabase.from('profiles').select('*').eq('email', 'niky@gmail.com').single();
    if (user) {
        await supabase.from('profiles').update({ plan_type: 'free' }).eq('id', user.id);
        console.log('EXITO: niky@gmail.com devuelto a free');
    }
}
run();
