import { ArchetypeEngine } from './server/src/modules/user/archetypeEngine';
import { ChineseMathV1 } from './server/src/modules/chinese/ChineseMathV1';
import { ChineseAstrology } from './server/src/utils/chineseAstrology';

const birthDateISO = '1990-05-15T00:00:00Z';
const astrology = {
    sun: { sign: 'Taurus', house: 1 },
    moon: { sign: 'Aquarius', house: 10 },
    rising: { sign: 'Gemini', house: 1 },
    planets: []
};

// V1 Engine Output
const chineseV1 = ChineseMathV1.calculate(birthDateISO);
console.log(`V1 Output: ${chineseV1.animal} / ${chineseV1.element}`);

const archetypeV1 = ArchetypeEngine.calculate(
    astrology,
    { kicheName: 'Imox', tone: 1 },
    chineseV1.element,
    { lifePathNumber: 1 }
);
console.log(`Archetype Element: ${archetypeV1.dominante}`);

if (chineseV1.element !== 'Metal' || chineseV1.animal !== 'Caballo') {
    console.error("Identity Parity Failed! Values changed.");
    process.exit(1);
}

// Since Metal -> Aire in NAOS scoring, we expect some points to Aire.
console.log("Identity Parity: PASS");
