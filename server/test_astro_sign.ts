import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/l_her/naos-platform/server/.env' });
import { AstrologyService } from './src/modules/astrology/astroService';

async function testAstro() {
    try {
        console.log("Calculating profile for 1986-07-12...");
        const res = await AstrologyService.calculateProfile('1986-07-12', '12:00', 14.6349, -90.5069, -6);
        console.log("☀️ Sun Sign Info:", res.sun);
        console.log("🌙 Moon Sign Info:", res.moon);
        console.log("💫 Rising Sign Info:", res.rising);
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

testAstro();
