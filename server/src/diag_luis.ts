import { supabase } from './lib/supabase';

async function checkLuis() {
    console.log("🔍 Checking Luis's profile and tunings...");
    
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%Luis Alfredo%');
        
    if (pError || !profiles || profiles.length === 0) {
        console.error("❌ Profile not found:", pError?.message);
        return;
    }
    
    const profile = profiles[0]; // Take the first one for now
    
    console.log("✅ Profile found:", {
        id: profile.id,
        email: profile.email,
        telegram_chat_id: profile.telegram_chat_id,
        oracle_time: profile.oracle_time,
        utcOffset: profile.profile_data?.utcOffset
    });
    
    const { data: tunings, error: tError } = await supabase
        .from('coherence_tunings')
        .select('*')
        .eq('user_id', profile.id);
        
    if (tError) {
        console.error("❌ Tunings error:", tError.message);
        return;
    }
    
    console.log(`✅ Found ${tunings.length} tunings:`);
    tunings.forEach(t => {
        console.log(`- Aspect: ${t.aspect} | Schedule: ${t.cron_schedule} | Last Triggered: ${t.last_triggered_at}`);
    });
}

checkLuis();
