import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking Supabase URL:", supabaseUrl);
    const { data, error } = await supabase.from('coherence_tunings').select('*');
    if (error) {
        console.error("Error fetching tunings:", error);
    } else {
        console.log(`Found ${data.length} tunings.`);
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
