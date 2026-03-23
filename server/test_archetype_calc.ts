import { ArchetypeEngine } from './src/modules/user/archetypeEngine';
import { AstrologyService } from './src/modules/astrology/astroService';
import { NumerologyService } from './src/modules/numerology/service';
import { MayanCalculator, NAWALES } from './src/utils/mayaCalculator';
import { ChineseAstrology } from './src/utils/chineseAstrology';

async function testArchetype() {
    const birthDate = '1986-07-12';
    const birthTime = '12:00';
    
    // 1. Calculate base data
    const astro = await AstrologyService.calculateProfile(birthDate, birthTime, 14.6349, -90.5069, -6);
    const num = NumerologyService.calculateProfile(birthDate, 'Luis Alfredo');
    const mayan = MayanCalculator.calculate(birthDate);
    const chinese = ChineseAstrology.calculate(birthDate);

    const enrichedProfile = {
        name: 'Luis Alfredo',
        astrology: astro,
        numerology: num,
        mayan: {
            ...mayan,
            color: ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(NAWALES.findIndex((n: any) => n.name === mayan.kicheName) + 2) % 4]
        },
        chinese: {
            animal: chinese.animal,
            element: chinese.element
        }
    };

    const result = ArchetypeEngine.calculate(enrichedProfile);
    console.log("🏆 Resulting Archetype:", result.nombre);
    console.log("📊 Scores:", result.desglose?.scores);
    console.log("📋 Contribuciones:", JSON.stringify(result.desglose?.contribuciones, null, 2));
}

testArchetype();
