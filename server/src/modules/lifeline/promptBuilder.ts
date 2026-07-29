export class LifelinePromptBuilder {
    static build(
        userData: any, 
        pinnacles: any,
        currentPersonalYear: number,
        language: string = 'es'
    ): string {
        const isEs = language === 'es';

        const prompt = isEs 
            ? `Eres el Motor Evolutivo de NAOS (Escala Macro). Tu objetivo es generar la Arquitectura del "Eje Evolutivo" del usuario. 
Debes cruzar la matemática pitagórica de sus 4 grandes etapas de vida (Pináculos) con su carta natal astrológica, su nahual maya y su energía china.

DATOS DEL USUARIO:
- Nombre: ${userData.display_name || 'Arquitecto'}
- Nacimiento: ${userData.birth_date}
- Astrología: Sol en ${userData.sun_sign}, Luna en ${userData.moon_sign || '?'}, Ascendente en ${userData.ascendant_sign || '?'}
- Nahual Natal: ${userData.mayan_nawal || '?'}
- Astrología China Natal: ${userData.chinese_sign || '?'}
- Numerología Natal (Camino de Vida): ${userData.numerology_path || '?'}

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
      "index": 1, // 1 to 4
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
         "creativity": 80, // Entero 0-100
         "leadership": 50,
         "learning": 90,
         "expansion": 60,
         "relationships": 40
      },
      "deep_dive_esoteric": "Texto profundo de 3-4 líneas sintetizando las 4 Intelligence Sources en un lenguaje clínico y estratégico.",
      "deep_dive_biohacking": "Texto profundo de 3-4 líneas en lenguaje de alto rendimiento y biohacking."
    }
  ], // Repetir para los 4 pináculos
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
            : `English prompt...`;

        return prompt;
    }
}
