import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    try {
        const userId = undefined;
        await supabase.from('user_energy_snapshots').select('*').eq('user_id', userId);
        console.log("No error thrown");
    } catch (e: any) {
        console.log("THREW:", e.message);
    }
}
test();
