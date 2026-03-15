import { supabase } from '../src/lib/supabase';

async function check() {
    const { data: tunings, error } = await supabase
        .from('coherence_tunings')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("=== Tuning Cycles ===");
        tunings.forEach((t: any) => {
            console.log(`User: ${t.user_id} | Aspect: ${t.aspect} | Schedule: ${t.cron_schedule} | Last Triggered: ${t.last_triggered_at}`);
        });
    }
}

check();
