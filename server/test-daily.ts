import { DateUtils } from './src/utils/DateUtils';

function runDateUtilsTests() {
    console.log("--- DateUtils Tests ---");
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

    test('returns the correct local date when UTC is already tomorrow (UTC-8)', () => {
        const now = new Date('2026-09-13T01:00:00.000Z');
        const offset = -8;
        assertEqual(DateUtils.getUserLocalDate(offset, now), '2026-09-12');
    });

    test('returns the correct local date when local is already tomorrow (UTC+9)', () => {
        const now = new Date('2026-09-12T23:00:00.000Z');
        const offset = +9;
        assertEqual(DateUtils.getUserLocalDate(offset, now), '2026-09-13');
    });

    test('handles offset 0 correctly', () => {
        const now = new Date('2026-09-12T12:00:00.000Z');
        assertEqual(DateUtils.getUserLocalDate(0, now), '2026-09-12');
    });

    test('handles natal offset difference implicitly', () => {
        // Doesn't take natal offset, only currentTimezoneOffset
        const now = new Date('2026-09-13T01:00:00.000Z');
        assertEqual(DateUtils.getUserLocalDate(-6, now), '2026-09-12');
    });

    console.log(`Results: ${passed} passed, ${failed} failed.\n`);
}

runDateUtilsTests();
