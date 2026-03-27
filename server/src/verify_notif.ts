import { NotificationEngine } from './src/modules/notifications/NotificationEngine';
import { supabase } from './src/lib/supabase';
import { config } from './src/config/env';

async function verify() {
    console.log("🌌 Starting manual verification of NotificationEngine...");
    console.log("Supabase URL:", config.SUPABASE_URL);
    console.log("Using Service Role:", !!config.SUPABASE_SERVICE_ROLE_KEY);

    // 1. Check if we can read profiles (Verifying RLS bypass)
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, email').limit(5);
    if (pError) {
        console.error("❌ Failed to read profiles:", pError);
    } else {
        console.log("✅ Successfully read profiles (RLS bypass confirmed). Count:", profiles.length);
    }

    // 2. Run Tuning Cycles check
    console.log("\n🚀 Triggering checkTuningCycles...");
    try {
        await NotificationEngine.checkTuningCycles();
        console.log("✅ checkTuningCycles completed without crash.");
    } catch (e) {
        console.error("❌ checkTuningCycles failed:", e);
    }

    console.log("\n⌛ Verification finished.");
}

verify();
