import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f')
        .single();
    if (data) {
        console.log("PROFILE KEYS:", Object.keys(data));
        console.log("astrology:", data.astrology ? Object.keys(data.astrology) : null);
        console.log("profile_data:", data.profile_data ? Object.keys(data.profile_data) : null);
        console.log("natal_chart:", data.natal_chart ? Object.keys(data.natal_chart) : null);
    }
}
test();
