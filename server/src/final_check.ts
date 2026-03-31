import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('coherence_tunings').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error("Error:", error);
    } else {
        data.forEach(t => {
            console.log(`ID: ${t.id} | User: ${t.user_id} | Aspect: ${t.aspect} | Schedule: ${t.cron_schedule} | Last Triggered: ${t.last_triggered_at}`);
        });
    }
}

check();
