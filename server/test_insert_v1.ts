import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url || '', key || '');

async function tryInsert() {
    console.log("📝 Attempting a test insert into 'interaction_logs'...");
    const testData = {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_message: 'Test message',
        sigil_response: 'Test response',
        module: 'test'
    };

    const { data, error } = await supabase
        .from('interaction_logs')
        .insert(testData)
        .select();

    if (error) {
        console.error("❌ Insert failed:", error.message);
        console.error("Details:", JSON.stringify(error, null, 2));
    } else {
        console.log("✅ Insert successful!");
        console.log("📄 Inserted row data:", data);
    }
}

tryInsert();
