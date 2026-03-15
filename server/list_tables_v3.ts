import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url || '', key || '');

async function listTables() {
    console.log("📊 Listing all tables in 'public' schema...");

    // In PostgREST/Supabase, we can't always query pg_tables directly 
    // but we can try to guess or use an RPC if the user has one.
    // However, we can also just try to query a few known tables.

    const { data: tables, error } = await supabase
        .from('pg_tables') // This might fail if RLS or permissions block it
        .select('tablename')
        .eq('schemaname', 'public');

    if (error) {
        console.log("ℹ️ Direct pg_tables query failed (as expected for anon role).");
        console.log("📝 Attempting to list via a common introspection trick...");

        // This is a long shot, but sometimes works depending on config
        const { data: rpcTables, error: rpcError } = await supabase.rpc('get_tables');
        if (rpcError) {
            console.log("❌ get_tables RPC also failed.");
        } else {
            console.log("✅ Tables found:", rpcTables);
        }
    } else {
        console.log("✅ Tables found:", tables.map(t => t.tablename));
    }

    // Final check: does interaction_logs exist specifically?
    const { data, error: checkError } = await supabase.from('interaction_logs').select('count', { count: 'exact', head: true });
    if (checkError) {
        console.error("❌ interaction_logs check failed:", checkError.message);
    } else {
        console.log("✅ interaction_logs exists and has count:", data);
    }
}

listTables();
