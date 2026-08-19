
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkTables() {
    const { data, error } = await supabase
        .from('rituals_history')
        .select('*')
        .limit(1);
    
    if (error) {
        if (error.code === '42P01') {
            console.log('Table "rituals_history" does not exist.');
        } else {
            console.error('Error checking table:', error);
        }
    } else {
        console.log('Table "rituals_history" exists.');
    }
}

checkTables();
