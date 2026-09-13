import { NumerologyService } from './src/modules/numerology/service';

function runNumerologyTests() {
    console.log("--- Numerology Tests ---");
    let passed = 0, failed = 0;

    const test = (name: string, fn: () => void) => {
        try {
            fn();
            console.log(`[PASS] ${name}`);
            passed++;
        } catch (e: any) {
            console.error(`[FAIL] ${name}: ${e.message}`);
            failed++;
        }
    };

    const assertEqual = (a: any, b: any) => {
        if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
    };

    test('calculates correct daily numerology including master numbers', () => {
        // e.g. Local Date: 2026-09-12
        // Universal Year = 2+0+2+6 = 10 -> 1
        // Universal Month = UY(1) + 9 = 10 -> 1
        // Universal Day = UM(1) + 12 = 13 -> 4
        // Birth: 12 April (Month=4, Day=12)
        // Personal Year = Birth(12) + BirthMonth(4) + UY(1) = 17 -> 8
        // Personal Month = PY(8) + Month(9) = 17 -> 8
        // Personal Day = PM(8) + Day(12) = 20 -> 2
        
        const result = NumerologyService.calculateDailyNumerology('2026-09-12', 12, 4);
        
        assertEqual(result.universalYear, 1);
        assertEqual(result.universalMonth, 1);
        assertEqual(result.universalDay, 4);
        assertEqual(result.personalYear, 8);
        assertEqual(result.personalMonth, 8);
        assertEqual(result.personalDay, 2);
    });
    
    test('preserves master numbers', () => {
        // Local Date: 2029-11-22
        // UY = 2+0+2+9 = 13 -> 4
        // UM = 4 + 11 = 15 -> 6
        // UD = 6 + 22 = 28 -> 10 -> 1
        
        // Birth: 22 Nov (Month 11, Day 22)
        // PY = 22 + 11 + 4 = 37 -> 10 -> 1
        // PM = 1 + 11 = 12 -> 3
        // PD = 3 + 22 = 25 -> 7
        
        const res = NumerologyService.calculateDailyNumerology('2029-11-22', 22, 11);
        assertEqual(res.universalYear, 4);
        assertEqual(res.universalMonth, 6);
        assertEqual(res.universalDay, 1);
        assertEqual(res.personalYear, 1);
        assertEqual(res.personalMonth, 3);
        assertEqual(res.personalDay, 7);
    });

    console.log(`Results: ${passed} passed, ${failed} failed.\n`);
}

runNumerologyTests();
