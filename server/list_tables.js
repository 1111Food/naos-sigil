const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function listAllTables() {
    console.log('Listing all tables in all schemas...');

    // This query might require more permissions than anon key has, 
    // but let's try to get what we can from information_schema
    const { data, error } = await supabase
        .rpc('list_tables_v3'); // If a custom RPC exists

    if (error) {
        console.log('RPC list_tables_v3 failed, trying direct SQL via REST (might fail)...');
        // Fallback: try to query information_schema.tables directly if exposed
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_schema, table_name')
            .neq('table_schema', 'information_schema')
            .neq('table_schema', 'pg_catalog');

        if (tablesError) {
            console.error('Error listing tables:', tablesError);
            return;
        }
        console.log('Tables found:');
        tables.forEach(t => console.log(`  - ${t.table_schema}.${t.table_name}`));
    } else {
        console.log('Data from RPC:', data);
    }
}

listAllTables();
