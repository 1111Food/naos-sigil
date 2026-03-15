
import { ArchetypeEngine } from './src/modules/user/archetypeEngine.js';

async function verify() {
    console.log("🧪 Diagnostic: Verifying ArchetypeEngine Robustness...");
    
    const testCases = [
        { name: "Full Data", astrology: { sun: { sign: 'Leo' } }, numerology: { lifePathNumber: 1 } },
        { name: "Spanish Signs", astrology: { sun: { sign: 'Aries' } }, numerology: { lifePathNumber: 22 } },
        { name: "Missing Data", astrology: {}, numerology: {} },
        { name: "Empty Profile", profile: {} }
    ];

    for (const test of testCases) {
        console.log(`\n--- Testing: ${test.name} ---`);
        try {
            const result = ArchetypeEngine.calculate(test);
            console.log(`✅ Result: ${result.nombre} (${result.frecuencia} - ${result.rol})`);
        } catch (e) {
            console.error(`❌ FAILED: ${test.name}`, e);
        }
    }
}

verify();
