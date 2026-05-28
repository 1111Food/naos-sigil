import { config } from '../../config/env';
import { UserProfile } from '../../types';
import { ChineseAstrology } from '../../utils/chineseAstrology';
import { MayanCalculator, NAWALES } from '../../utils/mayaCalculator';
import { NumerologyService } from '../../modules/numerology/service';
import { AstrologyService } from '../astrology/astroService';
import fs from 'fs';
import { UserService } from './service';
import { ArchetypeEngine, ArchetypeResult } from './archetypeEngine';
import { supabase } from '../../lib/supabase';

export interface NaosIdentitySynthesis {
    arquetipo?: {
        nombre: string;
        frecuencia: string;
        rol: string;
        descripcion: string;
        elemento: string;
        desglose?: {
            scores: Record<string, number>;
            contribuciones: {
                astrologia: string[];
                maya: string[];
                chino: string[];
                numerologia: string[];
            }
        }
    };
    nucleo_estructural: string;
    campo_perceptivo: string;
    arquitectura_mental: string;
    motor_accion: string;
    expresion_proyeccion: string;
    direccion_evolutiva: string;
    conflicto_central: string;
    diagnostico_global: string;
    potencial_elevado: string;
    sombra_riesgo: string;
    conclusion_directa: string;
}

export class NaosCompilerService {
    private static TARGET_MODEL = "gemini-flash-latest";
    private static API_VERSION = "v1beta";

    static async compile(userId: string, forceRefresh = false, language: 'es' | 'en' = 'es'): Promise<NaosIdentitySynthesis> {
        const isEn = language === 'en';
        console.log(`[NAOS_COMPILER_v3.0] Incoming request for ${userId} (Force: ${forceRefresh}, Lang: ${language})`);
        const userProfile = await this.getCompleteProfile(userId);
        const { bible, archetype } = await this.consolidateBible(userProfile, language);

        if (!forceRefresh) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('naos_identity_code, profile_data')
                .eq('id', userId)
                .maybeSingle();

            let cachedCode = profile?.naos_identity_code || profile?.profile_data?.naos_identity_code;
            
            // Check if cached code matches requested language
            if (cachedCode && (cachedCode as any).language === language) {
                if (typeof cachedCode === 'string') {
                    try { cachedCode = JSON.parse(cachedCode); } catch (e) {}
                }

                const keys = Object.keys(cachedCode as any);
                const values = Object.values(cachedCode as any);
                
                const cachedArchetype = (cachedCode as any).arquetipo;
                const hasArchetype = !!(cachedArchetype && cachedArchetype.nombre && 
                                      cachedArchetype.nombre !== "Calculando..." && 
                                      cachedArchetype.nombre !== "Buscando...");
                                      
                // Check if all 11 new sections are present in cache
                const matchesMandatory = !!((cachedCode as any).diagnostico_global && 
                                   (cachedCode as any).potencial_elevado && 
                                   (cachedCode as any).conclusion_directa);

                const hasNarrativeBlocks = matchesMandatory && keys.length >= 11;
                const narrativeIsClean = !values.some(v => {
                    if (typeof v === 'object' && v !== null && 'nombre' in v) {
                        return v.nombre === "Calculando..." || v.nombre === "Buscando...";
                    }
                    return v === "Buscando equilibrio..." || v === "Sintonizando esencia..." || 
                           v === "Alineando..." || (typeof v === 'string' && (v.includes("...") && v.length < 50));
                });

                if (hasNarrativeBlocks && narrativeIsClean && !hasArchetype) {
                    console.log(`🧬 NaosCompiler: Repairing cached identity for ${userId}...`);
                    const enrichedResult = {
                        ...(cachedCode as any),
                        arquetipo: {
                            id: archetype.id,
                            nombre: archetype.nombre,
                            frecuencia: archetype.frecuencia,
                            rol: archetype.rol,
                            descripcion: archetype.descripcion,
                            elemento: archetype.elemento_dominante,
                            desglose: archetype.desglose
                        }
                    };
                    this.persistSynthesis(userId, enrichedResult).catch(() => {});
                    return enrichedResult;
                }

                const isPoisoned = !hasArchetype || !hasNarrativeBlocks || !narrativeIsClean;
                if (!isPoisoned) {
                    return cachedCode as NaosIdentitySynthesis;
                }
            }
        }

        try {
            console.log(`🚀 NaosCompiler: Starting full 11-section compilation for ${userId} (${language})...`);
            const synthesis = await this.callGeminiCompiler(bible, archetype, language, userId);

            const isValid = Object.entries(synthesis).every(([k, v]) => {
                if (k === 'arquetipo') return true;
                return v && v.length > 50 && !v.includes("...");
            });

            if (isValid) {
                await this.persistSynthesis(userId, synthesis);
            }
            
            const finalSynthesis = {
                ...synthesis,
                language, // Store language to validate cache
                arquetipo: {
                    id: archetype.id,
                    nombre: archetype.nombre,
                    frecuencia: archetype.frecuencia,
                    rol: archetype.rol,
                    descripcion: archetype.descripcion,
                    elemento: archetype.elemento_dominante,
                    desglose: archetype.desglose
                }
            };
            
            return finalSynthesis;

        } catch (error: any) {
            console.error(`🔥 NaosCompiler Meta-Failure for ${userId}:`, error.message);
            
            // Fallback for ANY compilation failure to ensure UI integrity
            const { data: profile } = await supabase.from('profiles').select('naos_identity_code, profile_data').eq('id', userId).maybeSingle();
            let cached = profile?.naos_identity_code || profile?.profile_data?.naos_identity_code;
            
            const keys = [
                'nucleo_estructural', 'campo_perceptivo', 'arquitectura_mental', 'motor_accion',
                'expresion_proyeccion', 'direccion_evolutiva', 'conflicto_central', 'diagnostico_global',
                'potencial_elevado', 'sombra_riesgo', 'conclusion_directa'
            ];

            if (cached) {
                if (typeof cached === 'string') try { cached = JSON.parse(cached); } catch(e) {}
                const repaired: any = { ...(cached as any) };
                
                keys.forEach(key => {
                    const val = repaired[key];
                    const isInvalid = !val || val === "Calculando..." || val === "Buscando..." || 
                                    (typeof val === 'string' && val.includes("...") && val.length < 50);
                    
                    if (isInvalid) {
                        repaired[key] = NaosCompilerService.generateLocalNarrative(key, bible, archetype, language);
                    }
                });

                repaired.arquetipo = {
                    nombre: archetype.nombre,
                    frecuencia: archetype.frecuencia,
                    rol: archetype.rol,
                    descripcion: archetype.descripcion,
                    elemento: archetype.elemento_dominante,
                    powerLines: archetype.powerLines,
                    desglose: archetype.desglose
                };

                console.log(`🛠️ NaosCompiler: Returning fully repaired fallback for ${userId}`);
                return repaired;
            }
            
            // If NO cache exists at all, generate a 100% local identity to avoid blocked UI
            const fallback: any = {};
            keys.forEach(k => { fallback[k] = NaosCompilerService.generateLocalNarrative(k, bible, archetype, language); });
            fallback.language = language;
            fallback.arquetipo = {
                nombre: archetype.nombre,
                frecuencia: archetype.frecuencia,
                rol: archetype.rol,
                descripcion: archetype.descripcion,
                elemento: archetype.elemento_dominante,
                powerLines: archetype.powerLines,
                desglose: archetype.desglose
            };
            return fallback;
        }
    }

    private static generateLocalNarrative(id: string, bible: any, archetype: any, language: 'es' | 'en' = 'es'): string {
        const isEn = language === 'en';
        const sign = bible.astrology?.sun || (isEn ? 'Leo' : 'Leo');
        const animal = bible.chinese_animal || (isEn ? 'Dragon' : 'Dragón');
        const role = archetype.rol;
        
        const templates_es: Record<string, string[]> = {
            nucleo_estructural: [
                `Como ${archetype.nombre}, tu esencia reside en unificar tu instinto de ${animal} con la luz solar de ${sign}. Tu ser profundo busca la manifestación consciente de tu maestría.`,
                `Representas la frecuencia ${archetype.frecuencia} pura. Tu núcleo original te impulsa a liderar con amor y a consolidar tu propósito a través de la disciplina.`
            ],
            campo_perceptivo: [
                `Tu campo de percepción combina una fina intuición con un análisis clínico de la realidad. Eres capaz de captar dinámicas invisibles y decodificar patrones emocionales complejos.`,
                `Operas con una sensibilidad altamente refinada. Percibes los contrastes del entorno y traduces el caos sensorial en estructura y verdad.`
            ],
            arquitectura_mental: [
                `Tu mente es profunda y estratégica, pero está expuesta a la trampa del sobreanálisis y la duda intelectual. Requieres anclar tus pensamientos para evitar la fatiga mental.`,
                `Posees una estructura mental enfocada en resolver complejidades. El reto es transmutar la rigidez en sabiduría mutable.`
            ],
            motor_accion: [
                `Tu acción se activa con fuerza cuando tu voluntad está en alineación con tu verdad interna. El conflicto surge ante la falta de decisión, donde puedes procrastinar o autosabotearte.`,
                `Eres un constructor de realidades. Sin embargo, tu motor requiere disciplina sostenida y dar el paso hacia la acción imperfecta para fluir.`
            ],
            expresion_proyeccion: [
                `Hacia el mundo exterior te proyectas con carisma, elocuencia y autoridad. Tu comunicación está diseñada para inspirar y transmitir saberes con impacto real.`,
                `Te muestras como un faro visible y elocuente. Tu autoexpresión florece al traducir verdades profundas de forma simple y digerible.`
            ],
            direccion_vital: [
                `Tu sendero de vida te empuja a materializar grandes proyectos prácticos. Vienes a dejar una huella duradera y a sostener estructuras con propósito elevado.`,
                `Tu destino florece al compás de la realización de tu arquetipo de ${role}. Avanzas integrando sabiduría ancestral en tu día a día.`
            ],
            conflicto_central: [
                `Vives en una tensión constante entre el deseo instintivo de libertad y tu imperativa necesidad de estructura. Tu mente quiere analizarlo todo antes de que tu corazón se atreva a actuar.`,
                `El conflicto reside en procesar demasiada información en silencio sin bajarla al plano terrenal. Aprender a elegirte a ti mismo es tu llave maestra.`
            ],
            diagnostico_global: [
                `Un perfil de alto calibre que mezcla gran intuición, mente crítica y potencial ejecutivo. Tu fortaleza es el análisis profundo, y tu talón de Aquiles la inacción.`,
                `Presentas un balance energético ideal para la mentoría y la arquitectura de sistemas complejos. Tu reto es domar la ansiedad.`
            ],
            potencial_elevado: [
                `En tu versión integrada, te conviertes en un maestro constructor con visión espiritual y autoridad pragmática, capaz de guiar a otros y transmutar el caos en belleza.`,
                `Alcanzas tu máxima vibración cuando comunicas verdades vividas, actúas con total confianza e impactas de forma duradera tu entorno.`
            ],
            sombra_riesgo: [
                `Tu sombra emerge en forma de cinismo, rigidez mental o miedo al fracaso en proyectos de gran escala. Cuidado con recluirte en exceso o dudar de tu valor.`,
                `El riesgo es quedarte en el eterno análisis contemplativo sin construir nada real. Evita la autoexigencia asfixiante.`
            ],
            conclusion_directa: [
                `Primero busca, luego comprende, y finalmente actúa. Eres el arquitecto de tu propio umbral evolutivo.`,
                `Tu sabiduría no sirve en el éter; bájala a la tierra y constrúyete desde tu propia verdad.`
            ]
        };

        const templates_en: Record<string, string[]> = {
            nucleo_estructural: [
                `As the ${archetype.nombre}, your essence lies in unifying your ${animal} instinct with the solar light of ${sign}. Your deep self seeks the conscious manifestation of your mastery.`,
                `You represent the pure ${archetype.frecuencia} frequency. Your original core drives you to lead with love and to consolidate your purpose through discipline.`
            ],
            campo_perceptivo: [
                `Your perceptive field combines a fine intuition with a clinical analysis of reality. You are capable of capturing invisible dynamics and decoding complex emotional patterns.`,
                `You operate with a highly refined sensitivity. You perceive the contrasts of the environment and translate sensory chaos into structure and truth.`
            ],
            arquitectura_mental: [
                `Your mind is deep and strategic, but exposed to the trap of overanalysis and intellectual doubt. You require anchoring your thoughts to avoid mental fatigue.`,
                `You possess a mental structure focused on resolving complexities. The challenge is to transmute rigidity into mutable wisdom.`
            ],
            motor_accion: [
                `Your action activates strongly when your will is aligned with your internal truth. Conflict arises from indecision, where you may procrastinate or self-sabotage.`,
                `You are a builder of realities. However, your engine requires sustained discipline and taking the step toward imperfect action to flow.`
            ],
            expresion_proyeccion: [
                `To the outside world, you project yourself with charisma, eloquence, and authority. Your communication is designed to inspire and transmit knowledge with real impact.`,
                `You show yourself as a visible and eloquent lighthouse. Your self-expression flourishes by translating deep truths in a simple and digestible way.`
            ],
            direccion_vital: [
                `Your life path pushes you to materialize large practical projects. You come to leave a lasting footprint and to sustain structures with an elevated purpose.`,
                `Your destiny flourishes to the beat of the realization of your ${role} archetype. You advance by integrating ancestral wisdom into your daily life.`
            ],
            conflicto_central: [
                `You live in a constant tension between the instinctive desire for freedom and your imperative need for structure. Your mind wants to analyze everything before your heart dares to act.`,
                `The conflict lies in processing too much information in silence without bringing it down to the earthly plane. Learning to choose yourself is your master key.`
            ],
            diagnostico_global: [
                `A high-caliber profile that blends great intuition, a critical mind, and executive potential. Your strength is deep analysis, and your Achilles' heel is inaction.`,
                `You present an ideal energetic balance for mentoring and the architecture of complex systems. Your challenge is to tame anxiety.`
            ],
            potencial_elevado: [
                `In your integrated version, you become a master builder with spiritual vision and pragmatic authority, capable of guiding others and transmuting chaos into beauty.`,
                `You reach your highest vibration when you communicate lived truths, act with complete confidence, and make a lasting impact on your environment.`
            ],
            sombra_riesgo: [
                `Your shadow emerges in the form of cynicism, mental rigidity, or fear of failure in large-scale projects. Beware of over-reclusion or doubting your value.`,
                `The risk is staying in eternal contemplative analysis without building anything real. Avoid suffocating self-demand.`
            ],
            conclusion_directa: [
                `First search, then understand, and finally act. You are the architect of your own evolutionary threshold.`,
                `Your wisdom is useless in the ether; bring it down to earth and build yourself from your own truth.`
            ]
        };

        const templates = isEn ? templates_en : templates_es;
        const list = templates[id] || (isEn ? [`Synchronizing the frequency of ${archetype.nombre} in the manifestation field.`] : [`Sincronizando la frecuencia de ${archetype.nombre} en el campo de manifestación.`]);
        return list[Math.floor(Math.random() * list.length)];
    }

    private static async getCompleteProfile(userId: string): Promise<any> {
        return await UserService.getProfile(userId);
    }

    private static async consolidateBible(profile: any, language: 'es' | 'en' = 'es') {
        const birthDate = profile.birthDate || new Date().toISOString().split('T')[0];
        const birthTime = profile.birthTime || "12:00";
        const lat = profile.coordinates?.lat || 14.6349;
        const lng = profile.coordinates?.lng || -90.5069;
        const offset = profile.utcOffset || -6;

        const astro = await AstrologyService.calculateProfile(birthDate, birthTime, lat, lng, offset);
        const num = NumerologyService.calculateProfile(birthDate, profile.name || 'Viajero');
        
        const mayan = MayanCalculator.calculate(birthDate);
        const chinese = ChineseAstrology.calculate(birthDate);

        const enrichedProfile = { 
            ...profile, 
            astrology: astro, 
            numerology: num,
            mayan: {
                ...mayan,
                color: ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(NAWALES.findIndex((n: any) => n.name === mayan.kicheName) + 2) % 4]
            },
            chinese: {
                animal: chinese.animal,
                element: chinese.element
            }
        };
        
        let archetype;
        try {
            archetype = ArchetypeEngine.calculate(enrichedProfile, language);
        } catch (engineError) {
            archetype = {
                id: "unknown",
                nombre: language === 'en' ? "The NAOS Traveler" : "El Viajero de NAOS",
                frecuencia: language === 'en' ? "Ethereal" : "Etérea",
                rol: "Constructor",
                descripcion: "Un alma en búsqueda de su verdadera frecuencia operativa.",
                elemento_dominante: "aire",
                desglose: { scores: {}, contribuciones: { astrologia: [], maya: [], chino: [], numerologia: [] } }
            } as ArchetypeResult;
        }

        return {
            bible: {
                astrology: {
                    sun: astro.sun?.sign || 'Unknown',
                    moon: astro.moon?.sign || 'Unknown',
                    ascendant: astro.rising?.sign || 'Unknown',
                    planets: astro.planets?.map((p: any) => ({ name: p.name, sign: p.sign, house: p.house })) || []
                },
                numerology: {
                    lifePath: num.lifePathNumber,
                    mission: num.pinaculo?.g
                }
            },
            archetype
        };
    }

    private static async callGeminiCompiler(bible: any, archetype: any, language: 'es' | 'en' = 'es', userId?: string): Promise<NaosIdentitySynthesis> {
        const isEn = language === 'en';
        const apiKey = config.GOOGLE_API_KEY;
        const url = `https://generativelanguage.googleapis.com/${this.API_VERSION}/models/${this.TARGET_MODEL}:generateContent?key=${apiKey}`;

        const systemPrompt = isEn 
            ? `You are the NAOS Compiler v3.0. Your function is to consolidate a deep architectural and psychological identity in a clinical, poetic, and mystical way.
The user's master archetype is: "${archetype.nombre}" (${archetype.rol} | ${archetype.frecuencia}).
Avoid excessive superficial technicalities. Use an evocative, clinical, deeply psychological, and serious tone.
Respond ONLY in JSON with the 11 blocks of narrative interfaces in ENGLISH.
FIELDS: 'nucleo_estructural', 'campo_perceptivo', 'arquitectura_mental', 'motor_accion', 'expresion_proyeccion', 'direccion_evolutiva', 'conflicto_central', 'diagnostico_global', 'potencial_elevado', 'sombra_riesgo', 'conclusion_directa'.`
            : `Eres el Compilador NAOS v3.0. Tu función es consolidar una identidad arquitectónica y psicológica profunda de forma clínica, poética y mística.
El arquetipo maestro del usuario es: "${archetype.nombre}" (${archetype.rol} | ${archetype.frecuencia}).
Evita tecnicismos superficiales. Usa un tono evocador, analítico, profundamente psicológico y serio.
Responde ÚNICAMENTE en JSON con los 11 bloques de interfaces narrativas en ESPAÑOL.
CAMPOS: 'nucleo_estructural', 'campo_perceptivo', 'arquitectura_mental', 'motor_accion', 'expresion_proyeccion', 'direccion_evolutiva', 'conflicto_central', 'diagnostico_global', 'potencial_elevado', 'sombra_riesgo', 'conclusion_directa'.`;

        const payload = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: `ADN ENERGÉTICO PARA COMPILACIÓN DE IDENTIDAD:\n${JSON.stringify(bible)}\n\nArquetipo base: ${JSON.stringify(archetype)}` }] }],
            generationConfig: { temperature: 0.25, response_mime_type: "application/json" }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("No synthesis generated");

            const rawJson = JSON.parse(text);
            const normalized = this.normalizeSynthesis(rawJson, bible, archetype, language);
            
            return {
                ...normalized,
                arquetipo: {
                    id: archetype.id,
                    nombre: archetype.nombre,
                    frecuencia: archetype.frecuencia,
                    rol: archetype.rol,
                    descripcion: archetype.descripcion,
                    elemento: archetype.elemento_dominante
                }
            } as NaosIdentitySynthesis;
        } catch (error: any) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    private static async persistSynthesis(userId: string, synthesis: NaosIdentitySynthesis) {
        try {
            console.log(`💾 [NaosCompiler] Persisting synthesis for ${userId}...`);
            const { error: columnError } = await supabase.from('profiles').update({ naos_identity_code: synthesis }).eq('id', userId);
            
            if (columnError) {
                console.warn(`⚠️ [NaosCompiler] 'naos_identity_code' column update failed, trying 'profile_data' fallback...`, columnError.message);
                const { data: current } = await supabase.from('profiles').select('profile_data').eq('id', userId).maybeSingle();
                const updatedData = { ...(current?.profile_data || {}), naos_identity_code: synthesis };
                const { error: fallbackError } = await supabase.from('profiles').update({ profile_data: updatedData }).eq('id', userId);
                
                if (fallbackError) {
                    console.error(`❌ [NaosCompiler] Fallback save to 'profile_data' failed:`, fallbackError.message);
                } else {
                    console.log(`✅ [NaosCompiler] Synthesis saved in 'profile_data' fallback for ${userId}`);
                }
            } else {
                console.log(`✅ [NaosCompiler] Synthesis saved in 'naos_identity_code' column for ${userId}`);
            }
        } catch (e: any) {
            console.error(`🔥 [NaosCompiler] Major crash during persistSynthesis:`, e.message);
        }
    }

    private static normalizeSynthesis(raw: any, bible: any, archetype: any, language: 'es' | 'en' = 'es'): Omit<NaosIdentitySynthesis, 'arquetipo'> {
        const findValue = (keys: string[]) => {
            for (const key of keys) {
                if (raw[key]) return raw[key];
                const foundKey = Object.keys(raw).find(k => k.toLowerCase() === key.toLowerCase() || k.toLowerCase().replace(/_/g, '') === key.toLowerCase().replace(/_/g, ''));
                if (foundKey) return raw[foundKey];
            }
            return null;
        };
        const normalize = (val: any, fallback: string) => {
            if (!val || (typeof val === 'string' && val.length < 5)) return fallback;
            return typeof val === 'string' ? val.trim() : JSON.stringify(val);
        };
        return {
            nucleo_estructural: normalize(findValue(['nucleo_estructural']), NaosCompilerService.generateLocalNarrative('nucleo_estructural', bible, archetype, language)),
            campo_perceptivo: normalize(findValue(['campo_perceptivo']), NaosCompilerService.generateLocalNarrative('campo_perceptivo', bible, archetype, language)),
            arquitectura_mental: normalize(findValue(['arquitectura_mental']), NaosCompilerService.generateLocalNarrative('arquitectura_mental', bible, archetype, language)),
            motor_accion: normalize(findValue(['motor_accion']), NaosCompilerService.generateLocalNarrative('motor_accion', bible, archetype, language)),
            expresion_proyeccion: normalize(findValue(['expresion_proyeccion', 'expresion_y_proyeccion']), NaosCompilerService.generateLocalNarrative('expresion_proyeccion', bible, archetype, language)),
            direccion_evolutiva: normalize(findValue(['direccion_evolutiva']), NaosCompilerService.generateLocalNarrative('direccion_evolutiva', bible, archetype, language)),
            conflicto_central: normalize(findValue(['conflicto_central']), NaosCompilerService.generateLocalNarrative('conflicto_central', bible, archetype, language)),
            diagnostico_global: normalize(findValue(['diagnostico_global']), NaosCompilerService.generateLocalNarrative('diagnostico_global', bible, archetype, language)),
            potencial_elevado: normalize(findValue(['potencial_elevado']), NaosCompilerService.generateLocalNarrative('potencial_elevado', bible, archetype, language)),
            sombra_riesgo: normalize(findValue(['sombra_riesgo', 'sombra_y_riesgo']), NaosCompilerService.generateLocalNarrative('sombra_riesgo', bible, archetype, language)),
            conclusion_directa: normalize(findValue(['conclusion_directa']), NaosCompilerService.generateLocalNarrative('conclusion_directa', bible, archetype, language))
        };
    }
}
