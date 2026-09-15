const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'http://127.0.0.1:54321', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDB() {
    console.log('--- TABLES ---');
    let { data: tables, error: e1 } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
    if (e1) console.error(e1);
    else console.log(tables.map(t => t.table_name).join(', '));

    console.log('\n--- FUNCTIONS ---');
    let { data: rpcs, error: e2 } = await supabase.from('information_schema.routines').select('routine_name').eq('routine_schema', 'public');
    if (e2) console.error(e2);
    else console.log(rpcs.map(r => r.routine_name).join(', '));
}

checkDB();
