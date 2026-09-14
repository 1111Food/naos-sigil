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

INSTRUCCIONES DE FUSIÓN:
Toma el molde numérico de cada Pináculo y crúzalo con los astros, el nahual y el animal chino. 
Todo el texto generado debe venir estrictamente en dos versiones (Jargon Toggle):
1. esoteric_reading: Usa lenguaje místico (tránsitos, nahuales, elementos, arquetipos).
2. biohacking_reading: Usa lenguaje conductual (enfoque, estrés, neuroplasticidad, rendimiento, hábitos, picos de energía).

FORMATO OBLIGATORIO DE RESPUESTA (Solo JSON, sin Markdown \`\`\`json):
{
  "pinnacles": [
    {
      "index": 1,
      "esoteric_reading": {
         "objetivo_evolutivo": "Resumen místico de 10 palabras",
         "riesgo_principal": "Riesgo místico corto",
         "virtud_desarrollar": "Virtud arquetípica",
         "talento_dormido": "Talento esotérico",
         "metricas_naos": "Qué medirá NAOS en esta etapa"
      },
      "biohacking_reading": {
         "objetivo_evolutivo": "Resumen conductual de 10 palabras",
         "riesgo_principal": "Riesgo conductual corto",
         "virtud_desarrollar": "Virtud psicológica",
         "talento_dormido": "Habilidad táctica",
         "metricas_naos": "Qué medirá NAOS en esta etapa"
      },
      "indicators": {
         "creativity": 80,
         "leadership": 50,
         "learning": 90,
         "expansion": 60,
         "relationships": 40
      },
      "deep_dive_esoteric": "Texto profundo de 3-4 líneas sintetizando las 4 Intelligence Sources en un lenguaje clínico y estratégico.",
      "deep_dive_biohacking": "Texto profundo de 3-4 líneas en lenguaje de alto rendimiento y biohacking."
    }
  ],
  "current_cycle": {
    "year_number": ${currentPersonalYear},
    "esoteric_reading": {
       "objetivo_evolutivo": "...",
       "riesgo_principal": "...",
       "virtud_desarrollar": "...",
       "talento_dormido": "...",
       "metricas_naos": "..."
    },
    "biohacking_reading": {
       "objetivo_evolutivo": "...",
       "riesgo_principal": "...",
       "virtud_desarrollar": "...",
       "talento_dormido": "...",
       "metricas_naos": "..."
    },
    "deep_dive_esoteric": "Lectura mística profunda para su Año Personal actual.",
    "deep_dive_biohacking": "Lectura conductual profunda para su Año Personal actual."
  }
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

FUSION INSTRUCTIONS:
Take the numerical mold of each Pinnacle and cross it with the stars, the nahual, and the Chinese animal.
All generated text must strictly come in two versions (Jargon Toggle):
1. esoteric_reading: Use mystical language (transits, nahuals, elements, archetypes).
2. biohacking_reading: Use behavioral language (focus, stress, neuroplasticity, performance, habits, energy peaks).

MANDATORY RESPONSE FORMAT (JSON only, no Markdown \`\`\`json):
{
  "pinnacles": [
    {
      "index": 1,
      "esoteric_reading": {
         "objetivo_evolutivo": "10-word mystical summary",
         "riesgo_principal": "Short mystical risk",
         "virtud_desarrollar": "Archetypal virtue",
         "talento_dormido": "Esoteric talent",
         "metricas_naos": "What NAOS will measure in this stage"
      },
      "biohacking_reading": {
         "objetivo_evolutivo": "10-word behavioral summary",
         "riesgo_principal": "Short behavioral risk",
         "virtud_desarrollar": "Psychological virtue",
         "talento_dormido": "Tactical skill",
         "metricas_naos": "What NAOS will measure in this stage"
      },
      "indicators": {
         "creativity": 80,
         "leadership": 50,
         "learning": 90,
         "expansion": 60,
         "relationships": 40
      },
      "deep_dive_esoteric": "3-4 lines deep text synthesizing the 4 Intelligence Sources in clinical and strategic language.",
      "deep_dive_biohacking": "3-4 lines deep text in high performance and biohacking language."
    }
  ],
  "current_cycle": {
    "year_number": ${currentPersonalYear},
    "esoteric_reading": {
       "objetivo_evolutivo": "...",
       "riesgo_principal": "...",
       "virtud_desarrollar": "...",
       "talento_dormido": "...",
       "metricas_naos": "..."
    },
    "biohacking_reading": {
       "objetivo_evolutivo": "...",
       "riesgo_principal": "...",
       "virtud_desarrollar": "...",
       "talento_dormido": "...",
       "metricas_naos": "..."
    },
    "deep_dive_esoteric": "Deep mystical reading for their current Personal Year.",
    "deep_dive_biohacking": "Deep behavioral reading for their current Personal Year."
  }
}`;
            
        return prompt;
    }
}
