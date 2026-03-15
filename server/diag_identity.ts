
import { NaosCompilerService } from './src/modules/user/naosCompiler.service';
import { supabase } from './src/lib/supabase';

async function diagnose() {
    const userId = '034c291f-c629-40d0-ba91-334ef8662135'; // ID de Amy Herrera de los logs
    console.log(`🔍 Iniciando diagnóstico de compilación para Amy (${userId})...`);

    try {
        console.log("📡 Llamando a NaosCompilerService.compile...");
        const result = await NaosCompilerService.compile(userId, true);
        console.log("✅ RESULTADO DE COMPILACIÓN:");
        console.log(JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.error("❌ ERROR EN COMPILACIÓN:", e.message);
        if (e.stack) console.error(e.stack);
    }
}

diagnose();
