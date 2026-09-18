
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avaikhukgugvcocwedsz.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'REDACTED';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing Supabase connection...");
    try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
            console.error("❌ Supabase Error:", error);
        } else {
            console.log("✅ Supabase Success. Found", data.length, "profiles.");
        }
    } catch (e) {
        console.error("❌ Connection Error:", e);
    }
}

test();
