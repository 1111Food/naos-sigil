const fs = require('fs');

let content = fs.readFileSync('server/src/modules/user/archetypeEngine.ts', 'utf8');

const search = `            const astro = profile.astrology || {};
            const sunElem = normalizeSign(astro.sun?.sign || astro.sunSign);
            const moonElem = normalizeSign(astro.moon?.sign || astro.moonSign);
            const risingElem = normalizeSign(astro.rising?.sign || astro.risingSign);

            if (sunElem) { 
                scores[sunElem] += 3; legacyScores[sunElem] += 3;
                contribuciones.astrologia.push(\`\${isEn ? 'Sun in' : 'Sol en'} \${astro.sun?.sign || astro.sunSign} (+3 \${sunElem})\`); 
            }
            if (moonElem) { 
                scores[moonElem] += 2; legacyScores[moonElem] += 2;
                contribuciones.astrologia.push(\`\${isEn ? 'Moon in' : 'Luna en'} \${astro.moon?.sign || astro.moonSign} (+2 \${moonElem})\`); 
            }
            if (risingElem) { 
                scores[risingElem] += 2; legacyScores[risingElem] += 2;
                contribuciones.astrologia.push(\`\${isEn ? 'Ascendant in' : 'Ascendente en'} \${astro.rising?.sign || astro.risingSign} (+2 \${risingElem})\`); 
            }`;

const replacement = `            const astro = profile.astrology || {};
            
            // Support both legacy direct fields and new planets array format
            const getPlanetSign = (name: string, legacy1: string, legacy2: string) => {
                if (astro.planets && Array.isArray(astro.planets)) {
                    const p = astro.planets.find((x: any) => x.name === name);
                    if (p && p.sign) return p.sign;
                }
                return astro[legacy1]?.sign || astro[legacy2];
            };

            const getHouseSign = (houseNum: number, legacy1: string, legacy2: string) => {
                if (astro.houses && Array.isArray(astro.houses)) {
                    const h = astro.houses.find((x: any) => x.house === houseNum);
                    if (h && h.sign) return h.sign;
                }
                return astro[legacy1]?.sign || astro[legacy2];
            };

            const sunSign = getPlanetSign('Sun', 'sun', 'sunSign');
            const moonSign = getPlanetSign('Moon', 'moon', 'moonSign');
            // Ascendant is 1st house cusp, or explicit rising field
            const risingSign = getHouseSign(1, 'rising', 'risingSign');

            const sunElem = normalizeSign(sunSign);
            const moonElem = normalizeSign(moonSign);
            const risingElem = normalizeSign(risingSign);

            if (sunElem) { 
                scores[sunElem] += 3; legacyScores[sunElem] += 3;
                contribuciones.astrologia.push(\`\${isEn ? 'Sun in' : 'Sol en'} \${sunSign} (+3 \${sunElem})\`); 
            }
            if (moonElem) { 
                scores[moonElem] += 2; legacyScores[moonElem] += 2;
                contribuciones.astrologia.push(\`\${isEn ? 'Moon in' : 'Luna en'} \${moonSign} (+2 \${moonElem})\`); 
            }
            if (risingElem) { 
                scores[risingElem] += 2; legacyScores[risingElem] += 2;
                contribuciones.astrologia.push(\`\${isEn ? 'Ascendant in' : 'Ascendente en'} \${risingSign} (+2 \${risingElem})\`); 
            }`;

content = content.replace(search, replacement);

fs.writeFileSync('server/src/modules/user/archetypeEngine.ts', content);
