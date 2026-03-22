import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function checkColumns() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Profile data:", data);
        if (data && data.length > 0) {
            console.log("Keys available:", Object.keys(data[0]));
        } else {
            console.log("No rows returned from profiles to check keys.");
        }
    }
}

checkColumns();
