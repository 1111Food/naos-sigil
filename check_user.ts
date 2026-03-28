import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

async function checkUser(userId: string) {
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("User Profile:", JSON.stringify(profile, null, 2));
    }
}

const targetId = process.argv[2] || '1c6e74b8-ad52-41c3-bc95-2577cd3c67c8';
checkUser(targetId);
