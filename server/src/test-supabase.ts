import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

async function testSupabase() {
    console.log("📡 TESTING SUPABASE...");
    console.log("URL:", supabaseUrl);
    
    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ ERROR: Missing credentials in .env");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('user_profiles').select('*').limit(1);

    if (error) {
        console.error("❌ SUPABASE ERROR:", error.message);
    } else {
        console.log("✅ SUCCESS: Connected to Supabase!");
        console.log("Sample Data:", data);
    }
}

testSupabase();
