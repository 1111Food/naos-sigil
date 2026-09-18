import { supabaseAdmin } from './src/lib/supabaseadmin';
async function run() {
    const { data, error } = await supabaseAdmin.from('profiles').select('naos_identity_code').eq('id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f').single();
    if (error) console.error(error);
    console.log(data?.naos_identity_code?.arquetipo?.nombre);
}
run();
