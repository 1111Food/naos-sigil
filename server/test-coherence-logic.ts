import { CoherenceEngine, CoherenceAction } from './src/modules/coherence/CoherenceEngine';

async function testCoherence() {
    console.log("🧩 SIMULACIÓN DE COHERENCIA V5.0 (REGLA 3/5) 🧩\n");

    const MOOD = 'NEUTRAL';

    // ESCENARIO 1: MANTENIMIENTO (3 Pilares)
    console.log("--- ESCENARIO 1: MANTENIMIENTO (3 Pilares) ---");
    let score = 60;
    console.log(`Inicio: ${score}%`);

    let result = CoherenceEngine.calculate(score, 'PROTOCOL_MAINTENANCE', MOOD);
    console.log(`Día con 3 Pilares: ${result.newScore}% (Esperado: 60)`);
    if (result.newScore === 60) console.log("✅ CONGELACIÓN EXITOSA");
    else console.error("❌ ERROR EN CONGELACIÓN");

    // ESCENARIO 2: EVOLUCIÓN (4-5 Pilares)
    console.log("\n--- ESCENARIO 2: PICO EVOLUTIVO (5 Pilares) ---");
    score = 60;
    result = CoherenceEngine.calculate(score, 'PROTOCOL_EVOLUTION', MOOD);
    console.log(`Día con 5 Pilares: ${result.newScore}% (Esperado: 65)`);
    if (result.newScore === 65) console.log("✅ EVOLUCIÓN EXITOSA");
    else console.error("❌ ERROR EN EVOLUCIÓN");

    // ESCENARIO 3: ENTROPÍA (0-2 Pilares)
    console.log("\n--- ESCENARIO 3: ENTROPÍA (Manual/Bajo Desempeño) ---");
    score = 60;
    result = CoherenceEngine.calculate(score, 'PROTOCOL_ENTROPIC', MOOD);
    console.log(`Día con 1 Pilar: ${result.newScore}% (Esperado: 57)`);
    if (result.newScore === 57) console.log("✅ ENTROPÍA APLICADA");
    else console.error("❌ ERROR EN ENTROPÍA");

    // ESCENARIO 4: RECOVERY MODE (Bonus < 45%)
    console.log("\n--- ESCENARIO 4: RECOVERY MODE (<45%) ---");
    score = 40;
    result = CoherenceEngine.calculate(score, 'PROTOCOL_EVOLUTION', MOOD);
    console.log(`Evolución desde 40%: ${result.newScore}% (Esperado: 40 + 5*2 = 50)`);
    if (result.newScore === 50) console.log("✅ BONUS DE RECUPERACIÓN APLICADO");
    else console.error("❌ ERROR EN RECUPERACIÓN");
}

testCoherence();
