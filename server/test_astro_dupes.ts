import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data } = await supabase
        .from('profiles')
        .select('astroData, natal_chart, profile_data, astrology')
        .eq('id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f')
        .single();
    if (data) {
        console.log("astroData:", data.astroData ? Object.keys(data.astroData) : "NULL/EMPTY");
        console.log("astrology:", data.astrology ? "POPULATED" : "NULL/EMPTY");
        console.log("profile_data.astrology:", data.profile_data && data.profile_data.astrology ? "POPULATED" : "NULL/EMPTY");
    }
}
test();
