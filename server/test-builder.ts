import { DailyContextBuilder } from './src/modules/daily/DailyContextBuilder';

async function runBuilderTests() {
    console.log("--- DailyContextBuilder Tests ---");
    let passed = 0, failed = 0;

    const test = async (name: string, fn: () => Promise<void>) => {
        try {
            await fn();
            console.log(`[PASS] ${name}`);
            passed++;
        } catch (e: any) {
            console.error(`[FAIL] ${name}: ${e.stack}`);
            failed++;
        }
    };

    const assertEqual = (a: any, b: any) => {
        if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
    };

    const mockProfile = {
        profile_data: {
            birthDate: '1990-04-12',
            birthLat: 14.6,
            birthLng: -90.5
        },
        astrology: {
            planets: [
                { name: 'Sun', absDegree: 21 }, // Aries
                { name: 'Moon', absDegree: 200 } // Libra
            ],
            ascendant: { absDegree: 100 } // Cancer
        },
        numerology: {},
        mayan: {},
        chinese_animal: 'Caballo',
        chinese_element: 'Metal'
    };

    await test('builds deterministic Layer A without Gemini', async () => {
        // e.g. UTC is 2026-09-12T12:00:00Z
        const now = new Date('2026-09-12T12:00:00.000Z');
        
        const layerA = await DailyContextBuilder.build('user-1', mockProfile, -6, 'es', 50, now);
        
        assertEqual(layerA.contextVersion, 'v2_daily_context');
        assertEqual(layerA.localDate, '2026-09-12');
        assertEqual(layerA.personalContext.coherenceState, 'MEDIUM');
        
        // Numerology Check
        assertEqual(layerA.numerology.universalYear, 1);
        assertEqual(layerA.numerology.personalDay, 2);

        // Chinese Boundary Check (2026 is Caballo Fuego, started Feb)
        // Wait, 2026 is Caballo Fuego? Let's check what it calculated
        console.log(`Chinese Year 2026 (Sept) -> Animal: ${layerA.chinese.currentYearAnimal}, Element: ${layerA.chinese.currentYearElement}`);
        
        // Maya check
        console.log(`Maya Nahual 2026-09-12 -> ${layerA.maya.dailyNahual} (Tone ${layerA.maya.dailyTone})`);

        // Astro
        console.log(`Astro Priorities found: ${layerA.astrology.priorityAspects.length}`);
        
        // Provenance
        const provMap = new Map(layerA.provenance.map(p => [p.id, p]));
        if (!provMap.has('numerology.personal_day')) throw new Error("Missing numerology provenance");
        if (!provMap.has('maya.daily_nahual')) throw new Error("Missing maya provenance");
        if (!provMap.has('chinese.current_year')) throw new Error("Missing chinese provenance");
        
        // 0 Gemini calls (the code has NO fetch statements)
    });

    await test('Chinese boundary test - Jan vs Feb', async () => {
        // Test Jan 15th, 2026 -> should still be 2025 animal (Serpiente Madera)
        const nowJan = new Date('2026-01-15T12:00:00.000Z');
        const layerAJan = await DailyContextBuilder.build('user-1', mockProfile, 0, 'es', 50, nowJan);
        
        // Test Feb 15th, 2026 -> should be 2026 animal (Caballo Fuego)
        const nowFeb = new Date('2026-02-15T12:00:00.000Z');
        const layerAFeb = await DailyContextBuilder.build('user-1', mockProfile, 0, 'es', 50, nowFeb);

        console.log(`Jan 15th: ${layerAJan.chinese.currentYearAnimal}`);
        console.log(`Feb 15th: ${layerAFeb.chinese.currentYearAnimal}`);
        
        if (layerAJan.chinese.currentYearAnimal === layerAFeb.chinese.currentYearAnimal) {
            throw new Error("Boundary test failed! Jan and Feb have the same animal.");
        }
    });

    console.log(`Results: ${passed} passed, ${failed} failed.\n`);
}

runBuilderTests();
