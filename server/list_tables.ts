import { supabase } from './src/lib/supabase';

async function listTables() {
    console.log("📋 Listando todas las tablas accesibles...");

    try {
        // Try to fetch from information_schema via RPC if possible, 
        // but often we don't have that RPC.
        // Let's try to fetch a row from a known table and then list others.

        // Another way: use the hidden property of supabase client if available 
        // or just try common names.

        console.log("Intentando obtener nombres de tablas desde una consulta deliberadamente errónea...");
        const { error } = await supabase.from('non_existent_table_xyz').select('*');
        console.log("Error (puede listar tablas sugeridas):", error?.message);

        // Try to query common NAOS tables
        const tables = ['profiles', 'intentions', 'user_evolution', 'interaction_logs', 'coherence_history', 'user_roster', 'rituals'];
        for (const table of tables) {
            const { error: tableError } = await supabase.from(table).select('count', { count: 'exact', head: true });
            if (!tableError) {
                console.log(`✅ Tabla encontrada: ${table}`);
            } else {
                console.log(`❌ Tabla NO encontrada: ${table} (${tableError.message})`);
            }
        }

    } catch (err) {
        console.error("🔥 Error:", err);
    }
}

listTables();
