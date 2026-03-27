import { supabase } from './src/lib/supabase';

async function checkUser() {
    console.log("🔍 Checking user: luisalfredoherreramendez@gmail.com");
    const { data: user, error } = await supabase
        .from('profiles')
        .select('id, email, telegram_chat_id, profile_data, language, plan_type')
        .eq('email', 'luisalfredoherreramendez@gmail.com')
        .maybeSingle();

    if (error) {
        console.error("❌ Error fetching user:", error);
        return;
    }

    if (!user) {
        console.log("❌ User not found.");
        return;
    }

    console.log("✅ User found:");
    console.log("ID:", user.id);
    console.log("Telegram ID:", user.telegram_chat_id);
    console.log("Plan:", user.plan_type);
    console.log("utcOffset in profile_data:", user.profile_data?.utcOffset);

    console.log("\n🔍 Checking tunings for this user:");
    const { data: tunings } = await supabase
        .from('coherence_tunings')
        .select('*')
        .eq('user_id', user.id);

    if (tunings && tunings.length > 0) {
        console.log("✅ Tunings found:");
        tunings.forEach(t => {
            console.log(`- Aspect: ${t.aspect} | Schedule: ${t.cron_schedule} | Active: ${t.is_active}`);
        });
    } else {
        console.log("ℹ️ No tunings found.");
    }
}

checkUser();
