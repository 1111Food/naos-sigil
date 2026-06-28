import { FastifyInstance } from 'fastify';
import { validateUser } from '../middleware/auth';
import { UserService } from '../modules/user/service';
import { AstrologyService } from '../modules/astrology/astroService';
import { NumerologyService } from '../modules/numerology/service';
import { MayanCalculator } from '../utils/mayaCalculator';
import { ChineseAstrology } from '../utils/chineseAstrology';
import { config } from '../config/env';

interface InterpretRequest {
    school: 'ASTRO' | 'NUMERO' | 'MAYA' | 'ORIENTAL';
    planet?: string;
    sign?: string;
    house?: number;
    number?: string | number;
    nawal?: string;
    animal?: string;
    language?: 'es' | 'en';
}

const interpretationCache = new Map<string, string>();

export async function interpretRoutes(app: FastifyInstance) {
    app.post<{ Body: InterpretRequest }>('/interpret', { 
        preHandler: [validateUser],
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const { school, planet, sign, house, number, nawal, animal, language = 'es' } = req.body;

        if (!school) {
            return reply.status(400).send({ error: "El campo 'school' es requerido." });
        }

        const cacheKey = `${school}-${planet || ''}-${sign || ''}-${house || ''}-${number || ''}-${nawal || ''}-${animal || ''}-${language}-${userId}`;
        if (interpretationCache.has(cacheKey)) {
            console.log(`⚡ [INTERPRET CACHE] Hit for key: ${cacheKey}`);
            return { interpretation: interpretationCache.get(cacheKey) };
        }

        try {
            console.log(`🔮 [INTERPRET START] school: ${school} | user: ${userId} | lang: ${language}`);
            
            // 1. Obtener perfil completo del viajero
            const profile = await UserService.getProfile(userId);

            // DB-backed persistent cache hit check
            const dbInterpretations = (profile as any).ai_interpretations || {};
            if (dbInterpretations[cacheKey]) {
                console.log(`⚡ [DB INTERPRET CACHE] Hit for key: ${cacheKey}`);
                interpretationCache.set(cacheKey, dbInterpretations[cacheKey]);
                return { interpretation: dbInterpretations[cacheKey] };
            }
            const birthDate = profile.birthDate || new Date().toISOString().split('T')[0];
            const birthTime = profile.birthTime || "12:00";
            const lat = profile.coordinates?.lat || 14.6349;
            const lng = profile.coordinates?.lng || -90.5069;
            const offset = profile.utcOffset || -6;

            // 2. Calcular datos en caliente para las 4 escuelas
            const astro = await AstrologyService.calculateProfile(birthDate, birthTime, lat, lng, offset);
            const num = NumerologyService.calculateProfile(birthDate, profile.name || 'Viajero');
            const maya = MayanCalculator.calculate(birthDate);
            const chinese = ChineseAstrology.calculate(birthDate);

            // 3. Crear bloque de contexto completo del Viajero para Gemini
            const userContext = `
CONTEXTO INTEGRADO DEL VIAJERO:
- Nombre: ${profile.name || 'Viajero'}
- Carta Astral: Sol en ${astro.sunSign || astro.sun?.sign}, Luna en ${astro.moonSign || astro.moon?.sign}, Ascendente en ${astro.risingSign || astro.rising?.sign}. Placements principales: ${JSON.stringify(astro.planets?.map((p: any) => ({ name: p.name, sign: p.sign, house: p.house })))}
- Numerología: Sendero de Vida (Life Path) ${num.lifePathNumber}, Pináculo: ${JSON.stringify(num.pinaculo)}
- Cosmogonía Maya: Nawal ${maya.kicheName}, Tono ${maya.tone}
- Sabiduría Oriental: Animal ${chinese.animal}, Elemento ${chinese.element}
`;

            // 4. Diseñar prompts de acuerdo a la escuela
            let promptBlueprint = '';
            let targetText = '';

            const isEn = language === 'en';

            if (school === 'ASTRO') {
                targetText = `Planeta: ${planet}, Signo: ${sign}, Casa: ${house}`;
                promptBlueprint = isEn 
                    ? `Act as an expert clinical-mystical psychoanalyst and master evolutionary astrologer. 
Explain the astrological configuration: **${planet} in ${sign} in House ${house}** for the traveler.

Your explanation must be highly professional, therapeutic, deep, and direct—avoid generic New Age talk or simple astrological definitions.

You must follow EXACTLY this 9-block markdown structure:
Provide a beautiful poetic header explaining the mixture of these 3 energies.
⸻
🧠 1. Essential Structure & Dynamism
🗣️ 2. Communication & Expression
📚 3. Learning & Educational Dynamics
🧩 4. Beliefs & Core Truths
👨‍👩‍👧 5. Immediate Environment & Childhood Conditioning
🌍 6. Expansion vs. Limitation (Central Conflict)
🧭 7. Evolutionary Mission
⚡ 8. Elevated Potential
🌑 9. Shadow
🔥 In Summary
(Provide a brief poetic, philosophical summary wrapping up the lesson of this placement)
⸻
🧬 Integration with you
(In this section, analyze in real-time how this placement (${planet} in ${sign} in House ${house}) interacts, contrasts, or synchronizes with the rest of their personal context: Life Path ${num.lifePathNumber}, Mayan Nawal ${maya.kicheName}, and Chinese Animal ${chinese.animal}. Point out internal tensions, synergies, and how they act in reality.)

Use clean bold formatting, bullet points, and high contrast tone.` 
                    : `Actúa como un psicoterapeuta clínico-místico y astrólogo evolutivo de primer nivel.
Explica la configuración astrológica: **${planet} en ${sign} en la Casa ${house}** para el viajero.

Tu explicación debe ser sumamente profesional, terapéutica, profunda y directa, libre de clichés espirituales o explicaciones de manual básico.

Debes seguir EXACTAMENTE la siguiente estructura en Markdown:
Escribe una introducción poética y profunda sobre la mezcla de estas tres energías.
⸻
🧠 1. Estructura y dinamismo esencial
🗣️ 2. Comunicación y expresión
📚 3. Dinámica de aprendizaje
🧩 4. Creencias y verdad profunda
👨‍👩‍👧 5. Entorno cercano y condicionamiento de infancia
🌍 6. Expansión vs. limitación (conflicto central)
🧭 7. Misión evolutiva
⚡ 8. Potencial elevado
🌑 9. Sombra
🔥 En resumen
(Escribe una breve conclusión filosófica y poética sobre el aprendizaje de esta posición)
⸻
🧬 Integración contigo
(En esta sección, analiza en tiempo real cómo esta posición astrológica (${planet} en ${sign} en la Casa ${house}) interactúa, choca o se potencia con el resto del mapa del viajero: su Sendero de Vida ${num.lifePathNumber}, su Nawal Maya ${maya.kicheName} y su Animal Chino ${chinese.animal}. Señala tensiones internas y cómo se expresa esto en su realidad conductual.)

Usa negritas, listas ordenadas/desordenadas y un tono de alto contraste intelectual.`;

            } else if (school === 'NUMERO') {
                targetText = `Número: ${number}, Posición en Pináculo: ${house}`;
                promptBlueprint = isEn
                    ? `Act as a master esoteric pythagorean numerologist and clinical psychologist.
Explain the vibration of **Number ${number}** acting in the position/house **${house}** for the traveler.

Your explanation must be highly professional, therapeutic, deep, and direct—avoid generic New Age definitions.

You must follow EXACTLY this 9-block markdown structure:
Provide a beautiful poetic header introducing this numerical vibration in their architecture.
⸻
🧠 1. Nature & Essence of the Number
🔍 2. Analytical Mind & High Intuition
🎭 3. Social Mask & External Expression
🧩 4. Challenges & the Trap of the Shadow
🧭 5. Evolutionary Mission in this Position
⚡ 6. Elevated Potential
🌑 7. Behavioral Shadow
💼 8. Money, Projects & Materialization
🔥 In Summary
(Provide a brief poetic, philosophical summary wrapping up the lesson of this numerical vibration)
⸻
🧬 Integration with you
(In this section, analyze in real-time how this numerical vibration (${number} in position ${house}) interacts, contrasts, or synchronizes with the rest of their personal context: Sol in ${astro.sunSign}, Mayan Nawal ${maya.kicheName}, and Chinese Animal ${chinese.animal}. Point out internal conflicts, synergies, and how they manifest in their life.)

Use clean bold formatting, bullet points, and high contrast tone.`
                    : `Actúa como un numerólogo pitagórico esotérico y psicólogo clínico de primer nivel.
Explica la vibración del **Número ${number}** actuando en la posición del Pináculo **${house}** para el viajero.

Tu explicación debe ser sumamente profesional, terapéutica, profunda y directa, libre de clichés espirituales o explicaciones de manual básico.

Debes seguir EXACTAMENTE la siguiente estructura en Markdown:
Escribe una introducción poética y profunda sobre esta vibración numérica en su diseño original.
⸻
🧠 1. Naturaleza y esencia del número
🔍 2. Mente analítica e intuición
🎭 3. Máscara social y expresión exterior
🧩 4. Desafíos y trampa de la sombra
🧭 5. Misión evolutiva en esta posición
⚡ 6. Potencial elevado
🌑 7. Sombra conductual
💼 8. Dinero, proyectos y materialización
🔥 En resumen
(Escribe una breve conclusión filosófica y poética sobre el aprendizaje de este número)
⸻
🧬 Integración contigo
(En esta sección, analiza en tiempo real cómo esta vibración numérica (${number} en posición ${house}) interactúa, choca o se potencia con el resto del mapa del viajero: su Sol en ${astro.sunSign}, su Nawal Maya ${maya.kicheName} y su Animal Chino ${chinese.animal}. Señala tensiones internas, bloqueos de ejecución y el puente hacia la manifestación.)

Usa negritas, listas ordenadas/desordenadas y un tono de alto contraste intelectual.`;

            } else if (school === 'MAYA') {
                targetText = `Nawal Maya: ${nawal}`;
                promptBlueprint = isEn
                    ? `Act as an elder keeper of the sacred Mayan long count and clinical transpersonal psychologist.
Explain the archetypal force of **Nawal ${nawal}** for the traveler.

Your explanation must be highly professional, therapeutic, deep, and direct—avoid generic New Age definitions.

You must follow EXACTLY this 9-block markdown structure:
Provide a beautiful poetic header explaining this galactic signature in their Mayan architecture.
⸻
🧠 1. Cosmic Essence of the Nawal
👁️ 2. Perceptive Field & Psychic Gifts
🌊 3. Emotional & Subconscious Dynamics
🧩 4. Kin Challenge: The Shadow Polarities
🤝 5. Harmonic Allies & Collective Resonance
🧭 6. Life Path & Spiritual Mission
⚡ 7. Sacred Gifts & Elevated Potential
🌑 8. Unintegrated Behavior & Shadow
🔥 In Summary
(Provide a brief poetic, philosophical summary wrapping up the lesson of this Nawal)
⸻
🧬 Integration with you
(In this section, analyze in real-time how this Nawal (${nawal}) interacts, contrasts, or synchronizes with the rest of their personal context: Sol in ${astro.sunSign}, Life Path ${num.lifePathNumber}, and Chinese Animal ${chinese.animal}. Point out internal conflicts, synergies, and how they manifest in their life.)

Use clean bold formatting, bullet points, and high contrast tone.`
                    : `Actúa como un guardián del tiempo del sincronario maya y psicólogo transpersonal clínico.
Explica la fuerza arquetípica del **Nawal ${nawal}** para el viajero.

Tu explicación debe ser sumamente profesional, terapéutica, profunda y directa, libre de clichés espirituales o explicaciones de manual básico.

Debes seguir EXACTAMENTE la siguiente estructura en Markdown:
Escribe una introducción poética y profunda sobre esta firma galáctica en su diseño original.
⸻
🧠 1. Esencia cósmica del Nawal
👁️ 2. Campo perceptivo y dones psíquicos
🌊 3. Dinámica emocional y subconsciente
🧩 4. El desafío del Kin: la polaridad sombra
🤝 5. Aliados armónicos y resonancia colectiva
🧭 6. Sendero de vida y misión espiritual
⚡ 7. Dones sagrados y potencial elevado
🌑 8. Comportamiento desintegrado y sombra
🔥 En resumen
(Escribe una breve conclusión filosófica y poética sobre el aprendizaje de este Nawal)
⸻
🧬 Integración contigo
(En esta sección, analiza en tiempo real cómo este Nawal (${nawal}) interactúa, choca o se potencia con el resto del mapa del viajero: su Sol en ${astro.sunSign}, su Sendero de Vida ${num.lifePathNumber} y su Animal Chino ${chinese.animal}. Señala tensiones internas, bloqueos y cómo este Nawal moldea su percepción diaria de la realidad.)

Usa negritas, listas ordenadas/desordenadas y un tono de alto contraste intelectual.`;

            } else if (school === 'ORIENTAL') {
                targetText = `Animal Chino: ${animal}`;
                promptBlueprint = isEn
                    ? `Act as an expert in Chinese Imperial Bazi Astrology and clinical instinctual-behavioral psychologist.
Explain the archetypal force of **Chinese Zodiac Animal ${animal}** for the traveler.

Your explanation must be highly professional, therapeutic, deep, and direct—avoid generic New Age definitions.

You must follow EXACTLY this 9-block markdown structure:
Provide a beautiful poetic header explaining this earthly animal signature.
⸻
🧠 1. Instinctive Force & Animal Archetype
🐅 2. Behavioral Patterns & Temperament
🌊 3. Element Expression in Action
🧩 4. Compatibility Dynamics & Allies
🌍 5. Tension Axis & Opposition Learning
💼 6. Abundance Flow & Wealth
❤️ 7. Love & Sacred Relationships
⚡ 8. Elevated Instinctive Potential
🌑 9. Shadow of the Totem
🔥 In Summary
(Provide a brief poetic, philosophical summary wrapping up the lesson of this earthly zodiac animal)
⸻
🧬 Integration with you
(In this section, analyze in real-time how this Chinese Animal (${animal}) interacts, contrasts, or synchronizes with the rest of their personal context: Sol in ${astro.sunSign}, Life Path ${num.lifePathNumber}, and Mayan Nawal ${maya.kicheName}. Point out internal conflicts, synergies, and how they manifest in their life.)

Use clean bold formatting, bullet points, and high contrast tone.`
                    : `Actúa como un experto en Astrología Imperial China BaZi y psicólogo conductual-instintivo.
Explica la fuerza arquetípica del **Animal del Zodiaco Chino ${animal}** para el viajero.

Tu explicación debe ser sumamente profesional, terapéutica, profunda y directa, libre de clichés espirituales o explicaciones de manual básico.

Debes seguir EXACTAMENTE la siguiente estructura en Markdown:
Escribe una introducción poética y profunda sobre esta firma instintiva terrenal.
⸻
🧠 1. Fuerza instintiva y arquetipo animal
🐅 2. Patrones conductuales y temperamento
🌊 3. Expresión del elemento en la acción
🧩 4. Dinámicas de compatibilidad y alianzas
🌍 5. Eje de tensión y aprendizaje de oposición
💼 6. Flujo de abundancia y dinero
❤️ 7. Amor y relaciones sagradas
⚡ 8. Potencial elevado instintivo
🌑 9. Sombra del Tótem
🔥 En resumen
(Escribe una breve conclusión filosófica y poética sobre el aprendizaje de este animal chino)
⸻
🧬 Integración contigo
(En esta sección, analiza en tiempo real cómo este Animal Chino (${animal}) interactúa, choca o se potencia con el resto del mapa del viajero: su Sol en ${astro.sunSign}, su Sendero de Vida ${num.lifePathNumber} y su Nawal Maya ${maya.kicheName}. Señala tensiones internas, bloqueos, y cómo este animal gobierna su instinto básico y forma de actuar en la realidad.)

Usa negritas, listas ordenadas/desordenadas y un tono de alto contraste intelectual.`;
            }

            // 5. Llamar a la API de Gemini (con reintentos y logs detallados)
            const apiKey = config.GOOGLE_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            const systemPrompt = `You are a master psychological-astrological synthesizer and clinical-mystical analyst. 
You write with the authority of a seasoned psychoanalyst and master of esoteric sciences.
Always write your response strictly in ${language === 'es' ? 'SPANISH' : 'ENGLISH'}.`;

            const payload = {
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ 
                    role: "user", 
                    parts: [{ 
                        text: `USER PROFILE DETAILS FOR SYNTHESIS:\n${userContext}\n\nTARGET FOR INTERPRETATION:\n${targetText}\n\nINSTRUCTIONS:\n${promptBlueprint}` 
                    }] 
                }],
                generationConfig: { temperature: 0.35 }
            };

            let response;
            let data;
            let retries = 2;

            while (retries > 0) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

                    response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`Gemini Error (${response.status}):`, errorText);
                        throw new Error(`Gemini API Response Error: ${response.status} - ${errorText}`);
                    }

                    data = await response.json();
                    break; // Exito
                } catch (err: any) {
                    console.error(`Gemini fetch attempt failed. Retries left: ${retries - 1}. Error:`, err.message);
                    retries--;
                    if (retries === 0) throw err;
                    await new Promise(res => setTimeout(res, 2000)); // wait 2s before retry
                }
            }

            const rawInterpretation = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!rawInterpretation) {
                throw new Error("No se pudo generar la interpretación dinámica.");
            }

            // Guardar en cache antes de enviar al cliente
            interpretationCache.set(cacheKey, rawInterpretation);
            
            // Persistir de forma permanente en la base de datos (Supabase JSONB profile_data)
            const updatedInterpretations = (profile as any).ai_interpretations || {};
            updatedInterpretations[cacheKey] = rawInterpretation;
            await UserService.updateProfile(userId, { ai_interpretations: updatedInterpretations } as any);
            
            console.log(`✅ [INTERPRET SUCCESS] cached permanently in DB: ${cacheKey}`);

            return { interpretation: rawInterpretation };

        } catch (e: any) {
            console.error("🔥 [INTERPRET ROUTE ERROR]:", e.message);
            return reply.status(500).send({ error: "No se pudo invocar el Oráculo profundo.", details: e.message });
        }
    });
}
