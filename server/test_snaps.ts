import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data, error } = await supabase
        .from('user_energy_snapshots')
        .select('snapshot_date, language, created_at')
        .eq('user_id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f')
        .order('created_at', { ascending: false });
    console.log("ERROR:", error);
    console.log("SNAPSHOTS:", data);
}
test();
