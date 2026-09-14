import { LifelinePromptBuilder } from '../server/src/modules/lifeline/promptBuilder';
import { LifelineEngine } from '../server/src/modules/lifeline/engine';
import { config } from 'dotenv';
config({ path: '../server/.env' });

async function run() {
    console.log("Building prompt...");
    const prompt = LifelinePromptBuilder.build(
        { display_name: "Test", birth_date: "1990-01-01" },
        { sunSign: "Aries", moonSign: "Taurus", ascendantSign: "Gemini" },
        { allPinnacles: [{value:1, startAge:0, endAge:30}, {value:2, startAge:30, endAge:40}, {value:3, startAge:40, endAge:50}, {value:4, startAge:50, endAge:99}], currentAge: 35, pinnacleIndex: 2, pinnacleValue: 2 },
        2024,
        'es'
    );
    console.log("Generating with AI...");
    try {
        const result = await LifelineEngine.generate(prompt);
        console.log("Result keys:", Object.keys(result));
        console.log("Has current_cycle.esoteric_reading?", !!result.current_cycle?.esoteric_reading);
        console.log("Has pinnacles[0].esoteric_reading?", !!result.pinnacles[0]?.esoteric_reading);
        // Save result
        const fs = require('fs');
        fs.writeFileSync('result_test.json', JSON.stringify(result, null, 2));
    } catch(e) {
        console.error("Error:", e);
    }
}
run();
