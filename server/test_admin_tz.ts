import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data } = await supabase.from('profiles').select('id, full_name, astrology').eq('id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f').single();
    if (data) {
        console.log("Admin Timezone Offset:", data.astrology?.timezone_offset);
    }
}
test();
