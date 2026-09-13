import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data, error } = await supabase.from('profiles').select('*').limit(2);
    if (error) { console.error(error); return; }
    if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
        console.log("Sample Data:", data[0]);
    }
}
test();
