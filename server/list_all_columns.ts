import { supabase } from './src/lib/supabase';

async function listAllColumns() {
    console.log("📋 Listando todas las columnas de todas las tablas en 'public'...");

    try {
        // Querying information_schema directly via a trick: 
        // PostgREST doesn't usually allow this, but let's try a different approach.
        // We can get table info by trying to select from suspected tables.

        const tables = [
            'profiles',
            'interaction_logs',
            'synastry_history',
            'coherence_history',
            'user_evolution',
            'intentions',
            'rituals',
            'user_roster'
        ];

        for (const table of tables) {
            console.log(`\n--- Tabla: ${table} ---`);
            const { data, error } = await supabase.from(table).select('*').limit(1);

            if (error) {
                console.error(`❌ Error: ${error.message} (${error.code})`);
            } else if (data && data.length > 0) {
                console.log("✅ Columnas:", Object.keys(data[0]));
            } else {
                console.log("ℹ️ Tabla vacía o inaccesible (pero existe).");
            }
        }

    } catch (err) {
        console.error("🔥 Error catastrófico:", err);
    }
}

listAllColumns();
