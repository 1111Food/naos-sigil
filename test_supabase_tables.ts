import { supabase } from './server/src/lib/supabase';

async function test() {
    console.log("Checking tables...");
    
    // 1. Check rituals_history
    const { data: ritual, error: ritualErr } = await supabase.from('rituals_history').select('*').limit(1);
    console.log("\n--- rituals_history test ---");
    if (ritualErr) {
        console.error("❌ Error rituals_history:", ritualErr.code, ritualErr.message);
    } else {
        console.log("✅ rituals_history loaded OK. Count:", ritual?.length);
    }

    // 2. Check synastry_history
    const { data: synastry, error: synastryErr } = await supabase.from('synastry_history').select('*').limit(1);
    console.log("\n--- synastry_history test ---");
    if (synastryErr) {
        console.error("❌ Error synastry_history:", synastryErr.code, synastryErr.message);
    } else {
        console.log("✅ synastry_history loaded OK. Count:", synastry?.length);
    }
}

test();
