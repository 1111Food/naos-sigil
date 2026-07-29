import { supabase } from '../../lib/supabase';
import { ConsciousnessEngine } from '../sigil/ConsciousnessEngine';

async function testAurora() {
    console.log("🔍 Buscando perfil de Luis...");
    const { data: user, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .ilike('full_name', '%luis%herrera%')
        .limit(1)
        .single();
        
    if (error || !user) {
        console.error("No se encontró el usuario:", error);
        return;
    }

    console.log(`✅ Usuario encontrado: ${user.full_name} (${user.id})`);
    console.log("🌌 Generando Transmisión AURORA usando Gemini 3.6 Flash...");
    
    try {
        const text = await ConsciousnessEngine.generateTransmission(user.id, 'AURORA', 'es');
        console.log("\n=======================================================");
        console.log("🌅 AURORA TRANSMISSION (PREVIEW):");
        console.log("=======================================================\n");
        console.log(text);
        console.log("\n=======================================================");
    } catch (e: any) {
        console.error("Error generating:", e.message);
    }
}

testAurora();
