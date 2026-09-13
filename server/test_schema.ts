import * as dotenv from 'dotenv'; dotenv.config();
import { supabase } from './src/lib/supabase';
async function test() {
    const { data } = await supabase
        .from('profiles')
        .select('astrology')
        .eq('id', '2c48f84f-2c2e-4b0d-b799-166709fd1d1f')
        .single();
    if (data && data.astrology) {
        const astro: any = data.astrology;
        console.log("ASCENDANT:", typeof astro.ascendant, astro.ascendant);
        console.log("MIDHEAVEN:", typeof astro.midheaven, astro.midheaven);
        console.log("SUN:", astro.planets.find((p: any) => p.name === 'Sun'));
        console.log("MOON:", astro.planets.find((p: any) => p.name === 'Moon'));
        console.log("HOUSES TYPE:", Array.isArray(astro.houses) ? Object.keys(astro.houses[0]) : "not array");
    }
}
test();
