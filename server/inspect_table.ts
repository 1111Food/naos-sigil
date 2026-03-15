import { supabase } from './src/lib/supabase';

async function inspectTable() {
    console.log("🔍 Inspeccionando tabla interaction_logs...");

    try {
        // Fetch one row to see columns
        const { data, error } = await supabase
            .from('interaction_logs')
            .select('*')
            .limit(1);

        if (error) {
            console.error("❌ Error al consultar:", JSON.stringify(error, null, 2));
            return;
        }

        if (data && data.length > 0) {
            console.log("✅ Columnas detectadas:", Object.keys(data[0]));
        } else {
            console.log("ℹ️ La tabla está vacía, intentando obtener metadata por RPC o similar...");
            // Alternative: try to insert a dummy row with wrong keys to trigger error with schema info
            const { error: insertError } = await supabase
                .from('interaction_logs')
                .insert({ non_existent_column: 'test' });

            console.log("Mensaje de error de inserción (puede contener pistas):", insertError?.message);
        }
    } catch (err) {
        console.error("🔥 Error:", err);
    }
}

inspectTable();
