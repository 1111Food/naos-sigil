
import { AstrologyEngine } from './modules/astrology/engine';

async function repro() {
    // 21 de Diciembre 2012, 03:00 AM Guatemala (UTC-6) -> 09:00 AM UTC
    const date = new Date(Date.UTC(2012, 11, 21, 9, 0, 0));
    const lat = 14.6349;
    const lng = -90.5069;

    console.log("--- REPRO TEST ---");
    console.log("Date (UTC):", date.toISOString());

    const chart = AstrologyEngine.calculateNatalChart(date, lat, lng);
    const sun = chart.planets.find(p => p.name === 'Sun');

    console.log("Calculated Sun Sign:", sun?.sign);
    console.log("Calculated Sun Degree:", sun?.degree);
    console.log("Calculated Sun Abs Longitude:", sun?.absDegree);

    // Sagittarius ends at 270.0. If >= 270, it's Capricorn.
    if (sun && sun.absDegree >= 270) {
        console.log("BUG CONFIRMED: Sun is in Capricorn (>= 270)");
    } else {
        console.log("Sun is in Sagittarius (< 270)");
    }
}

repro();
