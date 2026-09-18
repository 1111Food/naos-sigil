import { config } from './src/config/env';
import { AstrologyService } from './src/modules/astrology/astroService';
import { NumerologyService } from './src/modules/numerology/service';
import { MayanCalculator } from './src/utils/mayaCalculator';
import { ChineseAstrology } from './src/utils/chineseAstrology';

async function testInterpret(school: string, planet: string, sign: string, house: number, number: any) {
    console.log(`\n--- TESTING ${school} - ${planet || number} ---`);
    try {
        const birthDate = "1990-05-15";
        const birthTime = "12:00";
        const lat = 14.6;
        const lng = -90.5;
        const offset = -6;

        const astro = await AstrologyService.calculateProfile(birthDate, birthTime, lat, lng, offset);
        const num = NumerologyService.calculateProfile(birthDate, 'Viajero');
        const maya = MayanCalculator.calculate(birthDate);
        const chinese = ChineseAstrology.calculate(birthDate);

        console.log("Context calculated successfully.");

        let promptBlueprint = '';
        if (school === 'ASTRO') {
            promptBlueprint = `Act as an expert clinical-mystical psychoanalyst and master evolutionary astrologer. 
Explain the astrological configuration: **${planet} in ${sign} in House ${house}** for the traveler.`;
        } else if (school === 'NUMERO') {
            promptBlueprint = `Act as a master esoteric pythagorean numerologist and clinical psychologist.
Explain the vibration of **Number ${number}** acting in the position/house **${house}** for the traveler.`;
        }

        console.log("Prompt generated successfully.");
        console.log(promptBlueprint.substring(0, 50) + "...");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.GOOGLE_API_KEY}`;
        // we won't actually call Gemini to save tokens/time, we just want to see if it crashes BEFORE gemini
        console.log("SUCCESS. No crash before Gemini.");

    } catch (e: any) {
        console.error("CRASH:", e.message);
    }
}

async function run() {
    await testInterpret('ASTRO', 'Ascendant', 'Cancer', 1, null);
    await testInterpret('ASTRO', 'Jupiter', 'Leo', 2, null);
    await testInterpret('NUMERO', '', '', 0, 22);
}
run();
