const { MayanCalculator } = require('./server/dist/utils/mayaCalculator');
const { MayaMathV1 } = require('./server/dist/modules/maya/MayaMathV1');

const dates = [
    '2012-12-20', '2012-12-21', '2012-12-22', 
    '2000-01-01', '2000-02-28', '2000-02-29', '2000-03-01',
    '2023-12-31', '2024-01-01', 
    '2024-02-28', '2024-02-29', '2024-03-01',
    '1990-05-15', '1985-07-23', '1970-01-01',
    '2026-09-15', '2026-09-16', '2026-09-17',
    '2025-06-15', '2030-01-01'
];

console.log("DATE | LEGACY_NAWAL | LEGACY_TONE | MAYAMATH_NAWAL | MAYAMATH_TONE | MATCH");
let allMatch = true;
let allSystematic = true;
for (const d of dates) {
    const legacy = MayanCalculator.calculate(d, 'en');
    const math = MayaMathV1.calculate({ localDate: d });
    const match = legacy.kicheName === math.canonicalNawalKey && legacy.tone === math.tone;
    console.log(`${d} | ${legacy.kicheName} | ${legacy.tone} | ${math.canonicalNawalKey} | ${math.tone} | ${match}`);
    
    // systematic off by one check:
    const dDate = new Date(d + 'T12:00:00Z');
    dDate.setUTCDate(dDate.getUTCDate() - 1);
    const dMinus1 = dDate.toISOString().split('T')[0];
    const mathMinus1 = MayaMathV1.calculate({ localDate: dMinus1 });
    const isSystematic = legacy.kicheName === mathMinus1.canonicalNawalKey && legacy.tone === mathMinus1.tone;
    if (!isSystematic) {
        allSystematic = false;
    }
}
console.log("LEGACY_OFFSET_SYSTEMATIC:", allSystematic);