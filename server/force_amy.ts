
import { NaosCompilerService } from './src/modules/user/naosCompiler.service';
import { config } from './src/config/env';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

async function forceAmyRecall() {
    const amyId = "034c291f-c629-40d0-ba91-334ef8662135";
    console.log(`🧬 [TEST] Iniciando re-compilación de Arquetipo para Amy (${amyId})...`);
    
    try {
        console.log("📡 Llamando a NaosCompilerService.compile...");
        const synthesis = await NaosCompilerService.compile(amyId, true);
        console.log("✅ [SUCCESS] Síntesis con Arquetipo generada:");
        console.log(JSON.stringify(synthesis, null, 2));
    } catch (e: any) {
        console.error("❌ [ERROR] Fallo en la compilación de prueba:");
        console.error(e.message);
        if (e.stack) console.error(e.stack);
    }
}

forceAmyRecall();
