import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url || '', key || '');

async function inspectSchema() {
    console.log("🔍 Inspecting schema for 'interaction_logs'...");

    // In Supabase, we can query information_schema if we have permissions
    // If not, we can try a simple query and hope it works or use an RPC if defined

    const { data: columns, error } = await supabase
        .from('interaction_logs')
        .select('*')
        .limit(0); // Just get headers

    if (error) {
        console.error("❌ Error fetching headers:", error.message);
        return;
    }

    // Since it's empty, we might not get headers this way in some clients.
    // Let's try the direct SQL-like way via PostgREST if possible, 
    // but the most reliable way is often just attempting a small insert or using a system table.

    // Attempting to query information_schema.columns (may require higher privileges)
    const { data: schemaInfo, error: schemaError } = await supabase
        .rpc('get_schema_info', { table_name: 'interaction_logs' }); // Check if this RPC exists

    if (schemaError) {
        console.log("ℹ️ RPC failed, attempting direct query of information_schema (may fail)...");
        // This usually fails in anon/authenticated roles unless exposed
    } else {
        console.log("✅ Schema Info from RPC:", schemaInfo);
    }
}

// Since we know the table exists, but is empty, let's try to get columns 
// by checking the list_all_tables output from previous turns if I could.
// Wait, I can just try to insert a row and see if it fails or what columns it expects.

async function tryInsert() {
    console.log("📝 Attempting a test insert...");
    const testData = {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_message: 'Test message',
        sigil_response: 'Test response',
        module: 'test'
    };

    const { error } = await supabase
        .from('interaction_logs')
        .insert(testData);

    if (error) {
        console.error("❌ Insert failed:", error.message);
        if (error.message.includes('column') && error.message.includes('not found')) {
            console.log("💡 Suggests column names might be different.");
        }
    } else {
        console.log("✅ Insert successful! Columns confirmed: user_id, user_message, sigil_response, module");
    }
}

inspectSchema().then(() => tryInsert());
