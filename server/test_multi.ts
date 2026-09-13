import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data } = await supabase.from('profiles').select('id, email, full_name').eq('email', 'luisalfredoherreramendez@gmail.com');
    console.log("PROFILES:", data);
}
test();
