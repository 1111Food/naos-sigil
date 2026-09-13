import { ArchetypeEngine } from './server/src/modules/user/archetypeEngine';
import { AstrologyEngine } from './server/src/modules/astrology/engine';
import { ChineseAstrology } from './server/src/utils/chineseAstrology';
import { MayanCalculator, NAWALES } from './server/src/utils/mayaCalculator';
import { NumerologyService } from './server/src/modules/numerology/service';

async function runSimulation(count: number) {
    const archetypesNoColor: Record<string, number> = {};
    const archetypesColor: Record<string, number> = {};
    const elementsNoColor: Record<string, number> = {fuego:0, tierra:0, aire:0, agua:0};
    const elementsColor: Record<string, number> = {fuego:0, tierra:0, aire:0, agua:0};
    
    let tiesNoColor = 0; let tiesColor = 0; let changedArchetype = 0;
    
    for (let i = 0; i < count; i++) {
        const y = Math.floor(Math.random() * (2010 - 1950 + 1)) + 1950;
        const m = Math.floor(Math.random() * 12) + 1;
        const d = Math.floor(Math.random() * 28) + 1;
        const h = Math.floor(Math.random() * 24);
        const min = Math.floor(Math.random() * 60);
        
        const dateStr = \\-\-\\;
        const dateObj = new Date(Date.UTC(y, m-1, d, h, min));
        const lat = (Math.random() * 100) - 50; const lng = (Math.random() * 360) - 180;
        
        try {
            const chart = AstrologyEngine.calculateNatalChart(dateObj, lat, lng, 'Equal');
            const sun = chart.planets.find((p: any) => p.name === 'Sun');
            const moon = chart.planets.find((p: any) => p.name === 'Moon');
            const ascSign = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(chart.ascendant / 30)];
            const num = NumerologyService.calculateProfile(dateObj.toISOString(), 'Test');
            const chinese = ChineseAstrology.calculate(dateObj.toISOString());
            const mayan = MayanCalculator.calculate(dateStr);
            
            const intendedColor = ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(NAWALES.findIndex((n: any) => n.name === mayan.kicheName) + 2) % 4];
            
            const profileNoColor = { astrology: { sun: { sign: sun?.sign }, moon: { sign: moon?.sign }, rising: { sign: ascSign } }, mayan: { color: undefined }, chinese: { element: chinese.element }, numerology: { lifePathNumber: num.lifePathNumber } };
            const profileColor = { astrology: { sun: { sign: sun?.sign }, moon: { sign: moon?.sign }, rising: { sign: ascSign } }, mayan: { color: intendedColor }, chinese: { element: chinese.element }, numerology: { lifePathNumber: num.lifePathNumber } };
            
            const resultNoColor = ArchetypeEngine.calculate(profileNoColor, 'en');
            const resultColor = ArchetypeEngine.calculate(profileColor, 'en');
            
            archetypesNoColor[resultNoColor.nombre] = (archetypesNoColor[resultNoColor.nombre] || 0) + 1;
            elementsNoColor[resultNoColor.elemento_dominante]++;
            
            archetypesColor[resultColor.nombre] = (archetypesColor[resultColor.nombre] || 0) + 1;
            elementsColor[resultColor.elemento_dominante]++;
            
            if (resultNoColor.nombre !== resultColor.nombre) changedArchetype++;
            
            const sNo = resultNoColor.desglose?.scores as any;
            if (sNo) { const v = [sNo.fuego, sNo.tierra, sNo.aire, sNo.agua].sort((a:any,b:any) => b-a); if(v[0]>0 && v[0]===v[1]) tiesNoColor++; }
            
            const sCol = resultColor.desglose?.scores as any;
            if (sCol) { const v = [sCol.fuego, sCol.tierra, sCol.aire, sCol.agua].sort((a:any,b:any) => b-a); if(v[0]>0 && v[0]===v[1]) tiesColor++; }
        } catch(e) { }
    }
    console.log("=== RESULTS ===");
    console.log("Changed Archetypes: " + changedArchetype);
    console.log("Ties NO color: " + tiesNoColor);
    console.log("Ties WITH color: " + tiesColor);
    console.log("Elements NO color:", elementsNoColor);
    console.log("Elements WITH color:", elementsColor);
}
runSimulation(5000).catch(console.error);
