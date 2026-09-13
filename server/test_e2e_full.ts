import * as dotenv from 'dotenv'; dotenv.config();
import { LifelineService } from './src/modules/lifeline/service';
import { ForecastService } from './src/modules/forecast/service';
import { EnergyService } from './src/modules/energy/service';
import { supabase } from './src/lib/supabase';
import { UserService } from './src/modules/user/service';

const userId = '2c48f84f-2c2e-4b0d-b799-166709fd1d1f';
const lang = 'es';

async function testE2E() {
    console.log("=== INICIANDO E2E MACRO/MESO/MICRO ===");
    console.log("Usuario Admin:", userId);
    
    // 0. Update the timezone offset logic so we don't depend on stale cache
    const current = await UserService.getProfile(userId);
    console.log("Perfil Base cargado.");
    
    console.log("\n--- MACRO (LIFELINE) ---");
    let macro = await LifelineService.getLifeline(userId, lang);
    console.log("1er Get Macro (V1 cache should miss):", macro ? "CACHE HIT" : "CACHE MISS");
    if (!macro) {
        console.log("Generando Macro V2...");
        macro = await LifelineService.generateLifeline(userId, lang);
    }
    const macroCheck = await LifelineService.getLifeline(userId, lang);
    console.log("2do Get Macro (V2):", macroCheck ? "CACHE HIT V2" : "CACHE MISS");
    console.log("Astro Version Guardada:", macroCheck?.astro_context_version);

    console.log("\n--- MESO (FORECAST) ---");
    let meso = await ForecastService.getTimeMap(userId, lang);
    console.log("1er Get Meso (V1 cache should miss):", meso ? "CACHE HIT" : "CACHE MISS");
    if (!meso) {
        console.log("Generando Meso V2...");
        meso = await ForecastService.generateTimeMap(userId, lang);
    }
    const mesoCheck = await ForecastService.getTimeMap(userId, lang);
    console.log("2do Get Meso (V2):", mesoCheck ? "CACHE HIT V2" : "CACHE MISS");
    console.log("Astro Version Guardada:", mesoCheck?.astro_context_version);

    console.log("\n--- MICRO (ENERGY) ---");
    // Energy service auto-generates if missing
    console.log("Llamando EnergyService.getCurrentEnergy (Triggering generation if miss)...");
    const micro1 = await EnergyService.getCurrentEnergy(userId, lang);
    console.log("Micro Generado/Obtenido. Astro Version:", micro1.astro_context_version);
    console.log("Llamando EnergyService.getCurrentEnergy de nuevo (debe ser HIT)...");
    const micro2 = await EnergyService.getCurrentEnergy(userId, lang);
    console.log("Micro 2 obtenido. Astro Version:", micro2.astro_context_version);

}
testE2E().catch(console.error);

