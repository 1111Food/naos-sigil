import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data, error } = await supabase.from('profiles').select('id, name, email').limit(5);
    console.log(data);
}
test();
