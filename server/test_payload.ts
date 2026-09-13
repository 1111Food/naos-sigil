import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data } = await supabase
        .from('user_energy_snapshots')
        .select('payload')
        .eq('user_id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (data) {
        console.log("PAYLOAD ROOT KEYS:", Object.keys(data.payload));
        if (data.payload.daily) console.log("DAILY KEYS:", Object.keys(data.payload.daily));
        if (data.payload.weekly) console.log("WEEKLY KEYS:", Object.keys(data.payload.weekly));
        if (data.payload.metrics) console.log("METRICS KEYS:", Object.keys(data.payload.metrics));
        if (data.payload.behavioral) console.log("BEHAVIORAL KEYS:", Object.keys(data.payload.behavioral));
    }
}
test();
