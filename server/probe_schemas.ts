import { supabase } from './src/lib/supabase';

async function listEverything() {
    console.log("📋 Investigando todos los esquemas...");

    try {
        // We can't list schemas directly via PostgREST easily.
        // But we can try to query some standard views if they are exposed.

        // Let's try to find if there's any RPC that allows raw SQL or metadata.
        // If not, let's try to guess schema names.
        const schemas = ['public', 'auth', 'storage', 'realtime', 'sigil', 'naos'];
        const tables = ['interaction_logs', 'chat_logs', 'logs', 'interactions'];

        for (const schema of schemas) {
            for (const table of tables) {
                const fullName = `${schema}.${table}`;
                const { error } = await supabase.from(fullName).select('count', { count: 'exact', head: true });
                if (!error) {
                    console.log(`✅ ¡ENCONTRADA!: ${fullName}`);
                    // Fetch one row to see columns
                    const { data } = await supabase.from(fullName).select('*').limit(1);
                    if (data && data.length > 0) {
                        console.log(`   Columnas: ${Object.keys(data[0])}`);
                    }
                } else if (error.code !== '42P01') {
                    // 42P01 is "relation does not exist". Anything else means it EXISTS but something else failed (eg 403)
                    console.log(`❓ Posible existencia: ${fullName} (Error: ${error.code} - ${error.message})`);
                }
            }
        }

    } catch (err) {
        console.error("🔥 Error:", err);
    }
}

listEverything();
