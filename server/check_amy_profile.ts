
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%Amy Herrera%')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching profile:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Found profile:", JSON.stringify(data[0], null, 2));
    } else {
        console.log("Profile not found for Amy Herrera");
    }
}

checkProfile();
