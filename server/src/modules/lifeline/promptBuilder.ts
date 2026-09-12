export class LifelinePromptBuilder {
    static build(
        userData: any, 
        astroContext: any,
        pinnacles: any,
        currentPersonalYear: number,
        language: string = 'es'
    ): string {
        const isEs = language === 'es';

        const prompt = isEs 
            ? `Eres el Motor Evolutivo de NAOS (Escala Macro). Tu objetivo es generar la Arquitectura del "Eje Evolutivo" del usuario. 
Debes cruzar la matemática pitagórica de sus 4 grandes etapas de vida (Pináculos) con su carta natal astrológica, su nahual maya y su energía china.

DATOS DEL USUARIO:
- Nombre: ${userData.display_name || userData.name || 'Arquitecto'}
- Nacimiento: ${userData.birthDate || userData.birth_date}
- Astrología: Sol en ${astroContext?.sunSign}, Luna en ${astroContext?.moonSign}, Ascendente en ${astroContext?.ascendantSign}
- Nahual Natal: ${userData.nawal_maya || userData.mayan_nawal || '?'}
- Astrología China Natal: ${userData.chinese_animal || userData.chinese_sign || '?'}
- Numerología Natal (Camino de Vida): ${userData.numerology?.lifePathNumber || userData.numerology_path || '?'}
- Carta Natal Canónica: ${JSON.stringify(astroContext || {})}

CICLOS MAYORES (PINÁCULOS DE VIDA):
Pináculo 1: Vibración ${pinnacles.allPinnacles[0].value} (de los ${pinnacles.allPinnacles[0].startAge} a los ${pinnacles.allPinnacles[0].endAge} años)
Pináculo 2: Vibración ${pinnacles.allPinnacles[1].value} (de los ${pinnacles.allPinnacles[1].startAge} a los ${pinnacles.allPinnacles[1].endAge} años)
Pináculo 3: Vibración ${pinnacles.allPinnacles[2].value} (de los ${pinnacles.allPinnacles[2].startAge} a los ${pinnacles.allPinnacles[2].endAge} años)
Pináculo 4: Vibración ${pinnacles.allPinnacles[3].value} (de los ${pinnacles.allPinnacles[3].startAge} en adelante)
El usuario tiene ${pinnacles.currentAge} años y actualmente cursa el Pináculo ${pinnacles.pinnacleIndex}.

CICLO ACTUAL (ESCALA 9 AÑOS):
Actualmente el usuario está atravesando su Año Personal ${currentPersonalYear}.

INSTRUCCIONES CRÍTICAS:
1. No utilices Markdown (sin \`\`\`json).
2. Devuelve estrictamente el JSON.
3. El idioma debe ser ${language}.

ESTRUCTURA JSON REQUERIDA:
{
    "current_cycle": {
        "title": "...",
        "description": "...",
        "pinnacle_number": ${pinnacles.pinnacleValue},
        "personal_year": ${currentPersonalYear},
        "key_themes": ["...", "..."],
        "duration": "...",
        "karmic_lesson": "..."
    },
    "evolution_axis": {
        "origin": "...",
        "destination": "...",
        "core_challenge": "..."
    },
    "pinnacles": [
        { "number": 1, "value": ${pinnacles.allPinnacles[0].value}, "theme": "...", "active": ${pinnacles.pinnacleIndex === 1} },
        { "number": 2, "value": ${pinnacles.allPinnacles[1].value}, "theme": "...", "active": ${pinnacles.pinnacleIndex === 2} },
        { "number": 3, "value": ${pinnacles.allPinnacles[2].value}, "theme": "...", "active": ${pinnacles.pinnacleIndex === 3} },
        { "number": 4, "value": ${pinnacles.allPinnacles[3].value}, "theme": "...", "active": ${pinnacles.pinnacleIndex === 4} }
    ]
}`
            : `You are the NAOS Evolutionary Engine (Macro Scale). Your objective is to generate the Architecture of the user's "Evolution Axis".
You must cross the Pythagorean math of their 4 major life stages (Pinnacles) with their astrological natal chart, their Mayan nahual, and their Chinese energy.

USER DATA:
- Name: ${userData.display_name || userData.name || 'Architect'}
- Birth: ${userData.birthDate || userData.birth_date}
- Astrology: Sun in ${astroContext?.sunSign}, Moon in ${astroContext?.moonSign}, Ascendant in ${astroContext?.ascendantSign}
- Natal Nahual: ${userData.nawal_maya || userData.mayan_nawal || '?'}
- Chinese Astrology: ${userData.chinese_animal || userData.chinese_sign || '?'}
- Natal Numerology (Life Path): ${userData.numerology?.lifePathNumber || userData.numerology_path || '?'}
- Canonical Natal Chart: ${JSON.stringify(astroContext || {})}

MAJOR CYCLES (LIFE PINNACLES):
Pinnacle 1: Vibration ${pinnacles.allPinnacles[0].value} (from ${pinnacles.allPinnacles[0].startAge} to ${pinnacles.allPinnacles[0].endAge} years old)
Pinnacle 2: Vibration ${pinnacles.allPinnacles[1].value} (from ${pinnacles.allPinnacles[1].startAge} to ${pinnacles.allPinnacles[1].endAge} years old)
Pinnacle 3: Vibration ${pinnacles.allPinnacles[2].value} (from ${pinnacles.allPinnacles[2].startAge} to ${pinnacles.allPinnacles[2].endAge} years old)
Pinnacle 4: Vibration ${pinnacles.allPinnacles[3].value} (from ${pinnacles.allPinnacles[3].startAge} onwards)
The user is ${pinnacles.currentAge} years old and is currently in Pinnacle ${pinnacles.pinnacleIndex}.

CURRENT CYCLE (9-YEAR SCALE):
The user is currently navigating their Personal Year ${currentPersonalYear}.

CRITICAL INSTRUCTIONS:
1. Do not use Markdown (no \`\`\`json).
2. Return strictly the JSON object.
3. The language MUST be English.

REQUIRED JSON STRUCTURE:
{
    "current_cycle": {
        "title": "...",
        "description": "...",
        "pinnacle_number": ${pinnacles.pinnacleValue},
        "personal_year": ${currentPersonalYear},
        "key_themes": ["...", "..."],
        "duration": "...",
        "karmic_lesson": "..."
    },
    "evolution_axis": {
        "origin": "...",
        "destination": "...",
        "core_challenge": "..."
    },
    "pinnacles": [
        { "number": 1, "value": ${pinnacles.allPinnacles[0].value}, "theme": "...", "active": ${pinnacles.pinnacleIndex === 1} },
        { "number": 2, "value": ${pinnacles.allPinnacles[1].value}, "theme": "...", "active": ${pinnacles.pinnacleIndex === 2} },
        { "number": 3, "value": ${pinnacles.allPinnacles[2].value}, "theme": "...", "active": ${pinnacles.pinnacleIndex === 3} },
        { "number": 4, "value": ${pinnacles.allPinnacles[3].value}, "theme": "...", "active": ${pinnacles.pinnacleIndex === 4} }
    ]
}`;
            
        return prompt;
    }
}

