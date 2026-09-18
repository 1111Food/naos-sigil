const fs = require('fs');

let content = fs.readFileSync('server/src/modules/user/service.ts', 'utf8');

const searchBlock = `                const dbProfile: UserProfile = {
                    ...baseProfile,
                    id: data.id,`;

const replaceBlock = `                const resolvedAstrology = activeSub?.astrology || data.astrology || data.natal_chart || baseProfile.astrology || undefined;
                const resolvedNumerology = activeSub?.numerology || baseProfile.numerology || undefined;
                const resolvedMayan = activeSub?.mayan || baseProfile.mayan || undefined;
                const resolvedChinese = {
                     animal: activeSub?.chinese_animal || baseProfile.chinese_animal,
                     element: activeSub?.chinese_element || baseProfile.chinese_element,
                     birthYear: activeSub?.chinese_birth_year || baseProfile.chinese_birth_year
                };

                let canonicalArchetype = undefined;
                if (resolvedAstrology && resolvedNumerology && resolvedMayan) {
                     canonicalArchetype = ArchetypeEngine.calculate(
                         resolvedAstrology,
                         resolvedNumerology,
                         resolvedMayan,
                         resolvedChinese
                     );
                }

                const dbProfile: UserProfile = {
                    ...baseProfile,
                    id: data.id,
                    canonical_archetype: canonicalArchetype,`;

content = content.replace(searchBlock, replaceBlock);
fs.writeFileSync('server/src/modules/user/service.ts', content);
console.log("Injected canonical_archetype into UserService");
