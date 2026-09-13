import * as dotenv from 'dotenv'; dotenv.config();
import { AstrologyService } from './src/modules/astrology/astroService';
import { AstroContextBuilder } from './src/modules/astrology/AstroContextBuilder';
import { GeocodingService } from './src/modules/user/geocoding';

async function runTestCase(name: string, dateStr: string, timeStr: string, lat: number, lng: number) {
    const tzId = GeocodingService.getTimezoneId(lat, lng);
    const offset = GeocodingService.getHistoricalUtcOffset(tzId, dateStr, timeStr);
    
    console.log(`\n============================================`);
    console.log(`[QA TEST] ${name}`);
    console.log(`Date: ${dateStr} ${timeStr} | Lat: ${lat}, Lng: ${lng}`);
    console.log(`Timezone: ${tzId} | Calculated Historical Offset: ${offset}`);
    
    const chart = await AstrologyService.calculateProfile(dateStr, timeStr, lat, lng, offset);
    const context = AstroContextBuilder.normalize({ astrology: chart });
    
    console.log(`Sol: ${context?.sunSign} (${chart.planets.find((p: any) => p.name === 'Sun')?.degree.toFixed(2)}°)`);
    console.log(`Luna: ${context?.moonSign} (${chart.planets.find((p: any) => p.name === 'Moon')?.degree.toFixed(2)}°)`);
    console.log(`Ascendente: ${context?.ascendantSign} (${(context!.ascendantDegrees % 30).toFixed(2)}°)`);
    console.log(`Medio Cielo: ${(context!.midheavenDegrees % 30).toFixed(2)}° (Abs: ${context!.midheavenDegrees.toFixed(2)}°)`);
}

async function main() {
    await runTestCase('NY Summer 1995 (DST -4)', '1995-07-01', '12:00', 40.7128, -74.0060);
    await runTestCase('NY Winter 1995 (STD -5)', '1995-12-01', '12:00', 40.7128, -74.0060);
    await runTestCase('Oslo, Noruega', '2000-01-01', '12:00', 59.9139, 10.7522);
    await runTestCase('Moon Cusp Test', '2023-01-23', '15:00', 40.7128, -74.0060);
}
main().catch(console.error);

