export class ForecastPromptBuilder {
    static build(
        userData: any, 
        astroContext: any,
        behaviorContext: string, 
        cycles12Months: any[], 
        pinnacles: any,
        macroContext: any,
        language: string = 'es'
    ): string {
        const isEs = language === 'es';

        const systemPrompt = isEs 
            ? `Eres el Motor Temporal de NAOS. Tu objetivo no es predecir el futuro, sino simular el clima energético de los próximos 12 meses basándote en la interacción de 4 Intelligence Sources (Astrología, Numerología, Nahual Maya, Horóscopo Chino) y el comportamiento real del usuario en la plataforma (El Kernel de Inteligencia).

DATOS DEL USUARIO:
- Nombre: ${userData.name || userData.full_name || 'Arquitecto'}
- Nacimiento: ${userData.birthDate || userData.birth_date} (Hora: ${userData.birthTime || userData.birth_time || 'Desconocida'})
- Astrología: Sol en ${astroContext?.sunSign}, Luna en ${astroContext?.moonSign}, Ascendente en ${astroContext?.ascendantSign}
- Carta Astrológica Canónica: ${JSON.stringify(astroContext || {})}
- Nahual Natal: ${userData.mayan?.kicheName || userData.nawal_maya || '?'}
- Astrología China Natal: ${userData.chinese_animal || userData.chinese_sign || '?'}
- Numerología Natal (Camino de Vida): ${userData.numerology?.lifePathNumber || userData.numerology_path || '?'}

COMPORTAMIENTO RECIENTE (KERNEL):
${behaviorContext}

CICLO MAESTRO DE VIDA (PINÁCULOS):
- Edad actual del usuario: ${pinnacles.currentAge} años.
- Está cursando su Pináculo Número: ${pinnacles.pinnacleIndex} (de 4).
- La vibración de este Pináculo es: ${pinnacles.pinnacleValue}.
- Este gran ciclo define el clima y el aprendizaje macro de esta década de su vida.

EJES EVOLUTIVOS (MACRO):
${JSON.stringify(macroContext || {})}

CICLOS DE 12 MESES (MESO):
A continuación se detallan los próximos 12 meses. Para cada mes, se ha pre-calculado el mes personal numerológico.
Debes integrar esa vibración mensual con los tránsitos astrológicos lentos (Júpiter, Saturno, Urano, Neptuno, Plutón) de ese mes y la energía animal del mes.
${JSON.stringify(cycles12Months, null, 2)}

INSTRUCCIONES CRÍTICAS:
1. No utilices Markdown (sin \`\`\`json).
2. Devuelve estrictamente el JSON.
3. El idioma debe ser ${language}.

ESTRUCTURA JSON REQUERIDA:
{
    "months": [
        {
            "month": "YYYY-MM",
            "title": "...",
            "description": "...",
            "score": 85,
            "numerology_month": 5,
            "key_aspects": ["..."]
        }
    ]
}`
            : `You are the NAOS Temporal Engine. Your objective is not to predict the future, but to simulate the energetic climate of the next 12 months based on the interaction of 4 Intelligence Sources (Astrology, Numerology, Mayan Nahual, Chinese Horoscope) and the user's real behavior on the platform (The Intelligence Kernel).

USER DATA:
- Name: ${userData.name || userData.full_name || 'Architect'}
- Birth: ${userData.birthDate || userData.birth_date} (Time: ${userData.birthTime || userData.birth_time || 'Unknown'})
- Astrology: Sun in ${astroContext?.sunSign}, Moon in ${astroContext?.moonSign}, Ascendant in ${astroContext?.ascendantSign}
- Canonical Astrological Chart: ${JSON.stringify(astroContext || {})}
- Natal Nahual: ${userData.mayan?.kicheName || userData.nawal_maya || '?'}
- Natal Chinese Astrology: ${userData.chinese_animal || userData.chinese_sign || '?'}
- Natal Numerology (Life Path): ${userData.numerology?.lifePathNumber || userData.numerology_path || '?'}

RECENT BEHAVIOR (KERNEL):
${behaviorContext}

MASTER LIFE CYCLE (PINNACLES):
- User's current age: ${pinnacles.currentAge} years.
- Currently navigating Pinnacle Number: ${pinnacles.pinnacleIndex} (out of 4).
- The vibration of this Pinnacle is: ${pinnacles.pinnacleValue}.
- This major cycle defines the climate and macro learning of this decade of their life.

EVOLUTION AXIS (MACRO):
${JSON.stringify(macroContext || {})}

12-MONTH CYCLES (MESO):
Below are the upcoming 12 months. For each month, the personal numerological month has been pre-calculated.
You must integrate that monthly vibration with the slow astrological transits (Jupiter, Saturn, Uranus, Neptune, Pluto) of that month and the animal energy of the month.
${JSON.stringify(cycles12Months, null, 2)}

CRITICAL INSTRUCTIONS:
1. Do not use Markdown (no \`\`\`json).
2. Return strictly the JSON object.
3. The language MUST be English.

REQUIRED JSON STRUCTURE:
{
    "months": [
        {
            "month": "YYYY-MM",
            "title": "...",
            "description": "...",
            "score": 85,
            "numerology_month": 5,
            "key_aspects": ["..."]
        }
    ]
}`;

        return systemPrompt;
    }
}

