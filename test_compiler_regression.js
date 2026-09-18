const { MayanCalculator } = require('./server/dist/utils/mayaCalculator');
const { ArchetypeEngine } = require('./server/dist/modules/user/archetypeEngine');
const { MayaMathV1 } = require('./server/dist/modules/maya/MayaMathV1');

// Mock profile for 2012-12-21
const bDate = '2012-12-21';

// 1. OLD LEGACY (simulate what it would have been before we patched MayanCalculator)
const jd = Math.floor(365.25 * (2012 + 4716)) + Math.floor(30.6001 * (12 + 1)) + 21 + 2 - Math.floor(20/4) - 1524.5;
const tzolkinDays = Math.floor(jd - 584283);
const nawalIdxOld = ((tzolkinDays + 9) % 20 + 20) % 20;
const toneOld = ((tzolkinDays + 3) % 13 + 13) % 13 + 1;
const NAWALES = [
    { name: "B'atz'" }, { name: "E" }, { name: "Aj" }, { name: "Ix" }, { name: "Tz'ikin" },
    { name: "Ajmaq" }, { name: "No'j" }, { name: "Tijax" }, { name: "Kawoq" }, { name: "Ajpu" },
    { name: "Imox" }, { name: "Iq'" }, { name: "Aq'ab'al" }, { name: "K'at" }, { name: "Kan" },
    { name: "Kame" }, { name: "Kej" }, { name: "Q'anil" }, { name: "Toj" }, { name: "Tz'i'" }
];
const oldMaya = { kicheName: NAWALES[nawalIdxOld].name, tone: toneOld, color: ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(nawalIdxOld + 2) % 4] };

// 2. NEW CANONICAL (using our patched MayanCalculator)
const newMayaCalc = MayanCalculator.calculate(bDate, 'en');
const nawalIdxNew = NAWALES.findIndex(n => n.name === newMayaCalc.kicheName);
const newMaya = { kicheName: newMayaCalc.kicheName, tone: newMayaCalc.tone, color: ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(nawalIdxNew + 2) % 4] };

// Evaluate Archetype
const mockProfileOld = {
    astrology: { sunSign: 'Sagittarius', moonSign: 'Aries', ascendantSign: 'Leo' },
    chinese_animal: 'Dragon',
    numerology: { lifePathNumber: 2 },
    mayan: oldMaya
};
const mockProfileNew = {
    ...mockProfileOld,
    mayan: newMaya
};

const archOld = ArchetypeEngine.calculate(mockProfileOld, 'en');
const archNew = ArchetypeEngine.calculate(mockProfileNew, 'en');

console.log(`OLD_LEGACY_MAYA: ${oldMaya.kicheName} ${oldMaya.tone} (Color: ${oldMaya.color})`);
console.log(`NEW_CANONICAL_MAYA: ${newMaya.kicheName} ${newMaya.tone} (Color: ${newMaya.color})`);

console.log(`OLD_MAYA_ELEMENT_CONTRIBUTION: +3 to ${oldMaya.color === 'Azul' ? 'agua' : oldMaya.color === 'Amarillo' ? 'tierra' : oldMaya.color === 'Rojo' ? 'fuego' : 'aire'}`);
console.log(`NEW_MAYA_ELEMENT_CONTRIBUTION: +3 to ${newMaya.color === 'Azul' ? 'agua' : newMaya.color === 'Amarillo' ? 'tierra' : newMaya.color === 'Rojo' ? 'fuego' : 'aire'}`);

console.log(`OLD_ELEMENT_TOTALS:`, archOld.assignment_v2.elementScores);
console.log(`NEW_ELEMENT_TOTALS:`, archNew.assignment_v2.elementScores);

console.log(`OLD_ARCHETYPE: ${archOld.nombre}`);
console.log(`NEW_ARCHETYPE: ${archNew.nombre}`);