const { ArchetypeEngine } = require('./server/dist/modules/user/archetypeEngine');

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const COLORS = ['Rojo', 'Amarillo', 'Blanco', 'Azul'];

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const stats = {
    total: 0,
    fuego: 0, tierra: 0, aire: 0, agua: 0,
    tiesResolved: 0,
    secondPlaceAssigned: 0
};

for (let i = 0; i < 10000; i++) {
    const profile = {
        astrology: {
            sunSign: randomChoice(SIGNS),
            moonSign: randomChoice(SIGNS),
            risingSign: randomChoice(SIGNS)
        },
        mayan: {
            color: Math.random() > 0.1 ? randomChoice(COLORS) : undefined // 10% missing color
        }
    };
    
    const res = ArchetypeEngine.calculate(profile, 'es');
    stats.total++;
    stats[res.elemento_dominante]++;
    if (res.assignment_v2.assignmentReason === 'CO_DOMINANT_LEGACY_CORE_DISPLAY') stats.tiesResolved++;
    if (res.assignment_v2.secondaryElement !== null) stats.secondPlaceAssigned++;
}

console.log("--- ARCHETYPE V2 10K SIMULATION ---");
console.log(`Total: ${stats.total}`);
console.log(`Fuego: ${((stats.fuego / stats.total) * 100).toFixed(2)}%`);
console.log(`Tierra: ${((stats.tierra / stats.total) * 100).toFixed(2)}%`);
console.log(`Aire: ${((stats.aire / stats.total) * 100).toFixed(2)}%`);
console.log(`Agua: ${((stats.agua / stats.total) * 100).toFixed(2)}%`);
console.log(`Exact Ties Resolved (Legacy Fallback): ${((stats.tiesResolved / stats.total) * 100).toFixed(2)}%`);
console.log(`Profiles with strict Secondary Element: ${((stats.secondPlaceAssigned / stats.total) * 100).toFixed(2)}%`);
