import { ArchetypeEngine } from 'C:/Users/l_her/naos-platform/server/src/modules/user/archetypeEngine';
import { AstrologyEngine } from 'C:/Users/l_her/naos-platform/server/src/modules/astrology/engine';
import { ChineseAstrology } from 'C:/Users/l_her/naos-platform/server/src/utils/chineseAstrology';
import { MayanCalculator } from 'C:/Users/l_her/naos-platform/server/src/modules/maya/calculator';
import { NumerologyService } from 'C:/Users/l_her/naos-platform/server/src/modules/numerology/service';

async function runSimulation(count: number) {
    const archetypes: Record<string, number> = {};
    const roles: Record<number, number> = {1:0, 2:0, 3:0, 4:0};
    const elements: Record<string, number> = {fuego:0, tierra:0, aire:0, agua:0};
    const lifePaths: Record<number, number> = {};
    
    let ties = 0;
    
    const startYear = 1950;
    const endYear = 2010;
    
    console.log(`Starting simulation for ${count} profiles...`);
    
    for (let i = 0; i < count; i++) {
        const y = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
        const m = Math.floor(Math.random() * 12) + 1;
        const d = Math.floor(Math.random() * 28) + 1; // Safely avoid leap year issues
        const h = Math.floor(Math.random() * 24);
        const min = Math.floor(Math.random() * 60);
        
        const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const dateObj = new Date(Date.UTC(y, m-1, d, h, min));
        
        const lat = (Math.random() * 100) - 50; 
        const lng = (Math.random() * 360) - 180;
        
        try {
            const chart = AstrologyEngine.calculateNatalChart(dateObj, lat, lng, 'Equal');
            const sun = chart.planets.find((p: any) => p.name === 'Sun');
            const moon = chart.planets.find((p: any) => p.name === 'Moon');
            const asc = chart.ascendant;
            
            const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            const ascSign = ZODIAC_SIGNS[Math.floor(asc / 30)];
            
            const num = NumerologyService.calculateProfile(dateObj.toISOString(), 'Test');
            const chinese = ChineseAstrology.calculate(dateObj.toISOString());
            const mayan = MayanCalculator.calculate(dateStr);
            
            const NAWAL_COLORS: Record<string, string> = {
                "B'atz'": 'Rojo', "E": 'Amarillo', "Aj": 'Rojo', "I'x": 'Blanco', "Tz'ikin": 'Azul',
                "Ajmaq": 'Amarillo', "No'j": 'Azul', "Tijax": 'Blanco', "Kawoq": 'Azul', "Ajpu": 'Amarillo',
                "Imox": 'Azul', "Iq'": 'Blanco', "Aq'ab'al": 'Azul', "K'at": 'Amarillo', "Kan": 'Rojo',
                "Kame": 'Blanco', "Kej": 'Rojo', "Q'anil": 'Amarillo', "Toj": 'Rojo', "Tz'i'": 'Blanco'
            }; 
            
            const profile = {
                astrology: {
                    sun: { sign: sun?.sign },
                    moon: { sign: moon?.sign },
                    rising: { sign: ascSign }
                },
                mayan: { color: NAWAL_COLORS[mayan.kicheName] || 'rojo' },
                chinese: { element: chinese.element },
                numerology: { lifePathNumber: num.lifePathNumber }
            };
            
            const result = ArchetypeEngine.calculate(profile, 'en');
            
            const id = result.nombre;
            archetypes[id] = (archetypes[id] || 0) + 1;
            
            const lp = num.lifePathNumber;
            lifePaths[lp] = (lifePaths[lp] || 0) + 1;
            
            let rId = 1;
            if ([1, 5].includes(lp)) rId = 1;
            else if ([4, 8, 22].includes(lp)) rId = 2;
            else if ([2, 3, 6].includes(lp)) rId = 3;
            else if ([7, 9, 11, 33].includes(lp)) rId = 4;
            roles[rId]++;
            
            const el = result.elemento_dominante;
            elements[el] = (elements[el] || 0) + 1;
            
            if (result.desglose && result.desglose.scores) {
                const s = result.desglose.scores as any;
                const vals = [s.fuego, s.tierra, s.aire, s.agua].sort((a:any,b:any) => b-a);
                if (vals[0] > 0 && vals[0] === vals[1]) ties++;
            }
        } catch(e) {}
    }
    
    console.log("=== RESULTS ===");
    console.log("Archetypes:", JSON.stringify(archetypes, null, 2));
    console.log("Elements:", elements);
    console.log("Roles:", roles);
    console.log("Life Paths:", lifePaths);
    console.log(`Ties: ${ties} (${((ties/count)*100).toFixed(2)}%)`);
}

runSimulation(10000).catch(console.error);
