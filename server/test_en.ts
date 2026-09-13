import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data } = await supabase.from('user_energy_snapshots').select('*').eq('user_id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f').eq('language', 'en');
    console.log("EN ROWS:", data?.length);
}
test();
