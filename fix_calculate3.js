const fs = require('fs');
let userType = fs.readFileSync('server/src/modules/user/service.ts', 'utf8');

userType = userType.replace(
    /canonicalArchetype = ArchetypeEngine\.calculate\([\s\S]*?\);/m,
    `canonicalArchetype = ArchetypeEngine.calculate({
                         astrology: resolvedAstrology,
                         numerology: resolvedNumerology,
                         mayan: resolvedMayan,
                         chinese_animal: resolvedChinese?.animal,
                         chinese_element: resolvedChinese?.element,
                         chinese_birth_year: resolvedChinese?.birthYear
                     });`
);
fs.writeFileSync('server/src/modules/user/service.ts', userType);
console.log("Fixed calculate signature for real");
