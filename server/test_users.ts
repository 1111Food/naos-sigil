import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data } = await supabase.from('profiles').select('id, full_name, plan_type, email');
    console.log(data);
}
test();
