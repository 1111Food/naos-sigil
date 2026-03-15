
import { supabase } from './server/src/lib/supabase';

async function checkTable() {
    try {
        const { data, error } = await supabase
            .from('rituals_history')
            .select('*', { count: 'exact', head: true })
            .limit(1);
        
        if (error) {
            console.log("❌ La tabla 'rituals_history' NO parece existir o no es accesible:", error.message);
        } else {
            console.log("✅ Tabla 'rituals_history' confirmada en Supabase.");
        }
    } catch (e) {
        console.log("❌ Error de conexión:", e.message);
    }
}

checkTable();
