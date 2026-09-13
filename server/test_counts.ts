import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const lifelines = await supabase.from('user_lifelines').select('*', { count: 'exact', head: true });
    const time_maps = await supabase.from('user_time_maps').select('*', { count: 'exact', head: true });
    const energy = await supabase.from('user_energy_snapshots').select('*', { count: 'exact', head: true });
    console.log("LIFELINES COUNT:", lifelines.count);
    console.log("TIME_MAPS COUNT:", time_maps.count);
    console.log("ENERGY_SNAPSHOTS COUNT:", energy.count);
}
test();
