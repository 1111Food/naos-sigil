import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: 'server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Buscando usuario...');
    const { data: user, error: uErr } = await supabase.from('profiles').select('*').eq('email', 'niky@gmail.com').single();
    if (uErr) {
        console.error('Error finding user:', uErr);
        return;
    }
    console.log('Usuario encontrado:', user.id);
    const { error: updErr } = await supabase.from('profiles').update({ plan_type: 'premium_plus' }).eq('id', user.id);
    if (updErr) {
        console.error('Error updating profile:', updErr);
    } else {
        console.log('EXITO: niky@gmail.com ahora es Premium Plus');
    }
}
run();
