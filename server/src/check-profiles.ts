import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function checkProfile() {
    console.log("🔍 Checking profiles in Supabase...");
    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, full_name, onboarding_completed')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("❌ Error fetching profiles:", error);
        return;
    }

    console.log("📝 Recent Profiles:");
    console.table(data);
}

checkProfile();
