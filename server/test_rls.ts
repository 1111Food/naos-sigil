import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    // Force using anon key by removing service role key
    const { createClient } = require('@supabase/supabase-js');
    const anonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data, error } = await anonClient.from('profiles').select('*').eq('id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f').single();
    console.log("ANON PROFILE ERROR:", error);
    console.log("ANON PROFILE DATA:", data ? "FOUND" : "NULL");
}
test();
