import { DailyOracleEngine } from './modules/oracle/DailyOracleEngine';

function testTzolkin() {
    console.log("=== Testing Tzolkin ===");
    const baseDate = new Date("2012-12-21T00:00:00Z");
    const result = DailyOracleEngine.calculateTzolkin(baseDate);
    console.log(`2012-12-21 -> Tone: ${result.tone}, Nahual: ${result.nahual}`);
    if (result.tone === 4 && result.nahual === "Ajaw") {
        console.log("✅ Tzolkin Base Test PASSED!");
    } else {
        console.error("❌ Tzolkin Base Test FAILED!");
    }

    // Test Today or random date
    const today = new Date();
    const todayMaya = DailyOracleEngine.calculateTzolkin(today);
    console.log(`Today (${today.toISOString()}) -> Tone: ${todayMaya.tone}, Nahual: ${todayMaya.nahual}`);
}

function testNumerology() {
    console.log("\n=== Testing Numerology ===");
    const date = new Date("2026-01-05T00:00:00Z"); // 5 Jan 2026 (Prompt Example: 5 + 1 + 2+0+2+6 = 16 -> 7)
    const result = DailyOracleEngine.getNumerology(date);
    console.log(`2026-01-05 -> Day: ${result.dayNumber}, Universal: ${result.universal}`);
    if (result.dayNumber === 5 && result.universal === 7) {
        console.log("✅ Numerology Test PASSED!");
    } else {
        console.error("❌ Numerology Test FAILED! Expected Universal 7, got " + result.universal);
    }
}

function runAll() {
    testTzolkin();
    testNumerology();
}

runAll();
