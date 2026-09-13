import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { createClient } = require('@supabase/supabase-js');
    const anonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    const { data, error } = await anonClient
        .from('user_energy_snapshots')
        .select('payload')
        .eq('user_id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f')
        .eq('snapshot_date', '2026-09-11')
        .maybeSingle();
        
    console.log("ANON SNAPSHOT ERROR:", error);
    console.log("ANON SNAPSHOT DATA:", data);
}
test();
