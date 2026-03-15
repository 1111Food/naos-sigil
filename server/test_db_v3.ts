import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

console.log("🔗 Connecting to:", url?.replace(/(https:\/\/).*(.supabase.co)/, "$1***$2"));
console.log("🔑 Key defined:", !!key);

const supabase = createClient(url || '', key || '');

async function test() {
    console.log("📡 Querying interaction_logs...");
    const { data, error } = await supabase
        .from('interaction_logs')
        .select('*')
        .limit(1);

    if (error) {
        console.error("❌ Error:", JSON.stringify(error, null, 2));
    } else if (data && data.length > 0) {
        console.log("✅ Columns found in interaction_logs:", Object.keys(data[0]));
        console.log("📄 Sample row:", data[0]);
    } else {
        console.log("ℹ️ Table 'interaction_logs' exists but is empty.");

        // Try to find if it exists in another schema or has different columns via metadata
        const { data: tableInfo, error: tableError } = await supabase
            .rpc('get_table_columns', { t_name: 'interaction_logs' }); // hypothetical RPC

        if (tableError) {
            // Fallback: list all public tables again to be sure
            const { data: tables } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
            console.log("Public tables:", tables?.map(t => t.tablename));
        }
    }
}

test();
