import { supabase } from '../src/lib/supabase';

async function testUpsert() {
    console.log("Starting coherence_tunings upsert test...");
    try {
        // Encontraremos un user_id de prueba primero
        const { data: profile } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        if (!profile) {
            console.log("No profile found to test with.");
            return;
        }
        
        const userId = profile.id;
        console.log(`Using user_id: ${userId}`);

        const payload = {
            user_id: userId,
            module_type: 'elemental_lab',
            aspect: 'Respiración de Fuego',
            cron_schedule: '08:00',
            is_active: true
        };

        const { data, error } = await supabase
            .from('coherence_tunings')
            .upsert(payload, { onConflict: 'user_id,module_type,aspect' });

        if (error) {
            console.error("❌ UPSERT FAILED:", error);
        } else {
            console.log("✅ UPSERT SUCCESSFUL:", data);
        }

    } catch (e) {
        console.error("❌ Fatal crash inside test:", e);
    }
}

testUpsert();
