import { supabase } from './src/lib/supabase';

async function listAllTables() {
    console.log("🕵️ Buscando todas las tablas en todos los esquemas...");

    // Query information_schema.tables if possible
    // Note: PostgREST usually doesn't expose information_schema.
    // So we use a trick: try to query schemas we suspect.

    const schemas = ['public', 'naos', 'sigil', 'auth'];

    for (const schema of schemas) {
        console.log(`\n--- Esquema: ${schema} ---`);
        // We use an RPC if the project has one for listing tables, 
        // otherwise we just try common names.
        const tables = ['interaction_logs', 'interactions', 'chat_logs', 'logs'];

        for (const table of tables) {
            const fullName = `\"${schema}\".\"${table}\"`;
            const { data, error } = await supabase.from(fullName).select('*').limit(1);

            if (!error) {
                console.log(`✅ ${fullName} - Existe. Columnas:`, Object.keys(data[0] || {}));
                if (data[0]) console.log(`   Sample:`, data[0]);
            } else if (error.code !== '42P01') {
                console.log(`❓ ${fullName} - Error ${error.code}: ${error.message}`);
            }
        }
    }
}

listAllTables();
