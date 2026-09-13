import { TransitEngine } from './src/modules/astrology/TransitEngine';

function runAstroTests() {
    console.log("--- Astro Relevance Tests ---");
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

    test('calculates transits and extracts priority aspects based on strict orbs', () => {
        const transits = [
            { name: 'Sun', sign: 'Aries', absDegree: 15 }, 
            { name: 'Saturn', sign: 'Capricorn', absDegree: 280 },
            { name: 'Venus', sign: 'Taurus', absDegree: 40 },
            { name: 'Mars', sign: 'Gemini', absDegree: 75 }
        ];

        const natalPositions = {
            'Sun': 14.5, // 0.5 orb conjunction to transit Sun
            'Moon': 281.8, // 1.8 orb conjunction to Saturn
            'Ascendant': 100, // 85 deg from Sun, no major aspect
            'Venus': 221, // 40 opp 221 -> orb 1.0
            'Mars': 10 // no priority aspect
        };

        const aspects = TransitEngine.calculateAspects(transits, natalPositions);
        
        // Sun Conjunct Sun (orb 0.5) -> Priority
        const sunAspect = aspects.find(a => a.transitPlanet === 'Sun' && a.natalTarget === 'Sun');
        if (!sunAspect) throw new Error("Sun aspect missing");
        assertEqual(sunAspect.orb, 0.5);
        assertEqual(sunAspect.isPriority, true);

        // Saturn Conjunct Moon (orb 1.8) -> Priority because Saturn is slow
        const saturnAspect = aspects.find(a => a.transitPlanet === 'Saturn' && a.natalTarget === 'Moon');
        if (!saturnAspect) throw new Error("Saturn aspect missing");
        assertEqual(Math.round(saturnAspect.orb * 10) / 10, 1.8);
        assertEqual(saturnAspect.isPriority, true);

        // Venus Opposition Venus (orb 1.0) -> Priority!
        const venusAspect = aspects.find(a => a.transitPlanet === 'Venus' && a.natalTarget === 'Venus');
        if (!venusAspect) throw new Error("Venus aspect missing");
        assertEqual(venusAspect.aspectType, 'Opposition');
        assertEqual(venusAspect.orb, 1.0);
        assertEqual(venusAspect.isPriority, true);
    });

    test('Mars square natal Moon is priority', () => {
        const transits = [ { name: 'Mars', sign: 'Gemini', absDegree: 91 } ];
        const natalPositions = { 'Moon': 1 }; // 90 degrees separation -> square with orb 0
        const aspects = TransitEngine.calculateAspects(transits, natalPositions);
        
        const marsAspect = aspects.find(a => a.transitPlanet === 'Mars' && a.natalTarget === 'Moon');
        if (!marsAspect) throw new Error("Mars aspect missing");
        assertEqual(marsAspect.aspectType, 'Square');
        assertEqual(marsAspect.orb, 0);
        assertEqual(marsAspect.isPriority, true);
    });

    console.log(`Results: ${passed} passed, ${failed} failed.\n`);
}

runAstroTests();
