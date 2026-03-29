
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
    interfaz_social: string;
    nucleo_interno: string;
    patron_sombra: string;
    direccion_vital: string;
    tension_evolutiva: string;
    alquimia_vinculos: string;
    arquitectura_entorno: string;
    umbral_manifestacion: string;
}

export class NaosCompilerService {
    private static TARGET_MODEL = "gemini-flash-latest";
    private static API_VERSION = "v1beta";

    static async compile(userId: string, forceRefresh = false, language: 'es' | 'en' = 'es'): Promise<NaosIdentitySynthesis> {
        const isEn = language === 'en';
        console.log(`[NAOS_COMPILER_v2.7+] Incoming request for ${userId} (Force: ${forceRefresh}, Lang: ${language})`);
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
                                      
                const matchesMandatory = !!((cachedCode as any).alquimia_vinculos && 
                                   (cachedCode as any).arquitectura_entorno && 
                                   (cachedCode as any).umbral_manifestacion);

                const hasNarrativeBlocks = matchesMandatory && keys.length >= 8;
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
            console.log(`🚀 NaosCompiler: Starting full compilation for ${userId} (${language})...`);
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
                
                if (cached) {
                    if (typeof cached === 'string') try { cached = JSON.parse(cached); } catch(e) {}
                    
                    const keys = [
                        'interfaz_social', 'nucleo_interno', 'patron_sombra', 'direccion_vital',
                        'tension_evolutiva', 'alquimia_vinculos', 'arquitectura_entorno', 'umbral_manifestacion'
                    ];

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
                const keys = [
                    'interfaz_social', 'nucleo_interno', 'patron_sombra', 'direccion_vital',
                    'tension_evolutiva', 'alquimia_vinculos', 'arquitectura_entorno', 'umbral_manifestacion'
                ];
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
        const sign = bible.astrology?.sun || (isEn ? 'Leo' : 'Leo'); // Signs are same for now
        const animal = bible.chinese_animal || (isEn ? 'Dragon' : 'Dragón');
        const role = archetype.rol;
        
        const templates_es: Record<string, string[]> = {
            interfaz_social: [
                `Proyectas un aura de ${role} bajo la mirada de ${sign}. Tu danza social es un puente entre tu instinto de ${animal} y tu esencia sagrada.`,
                `Te manifiestas como un ${role} despierto. Tu máscara social equilibra la marea del ${animal} con la luz de tus coordenadas celestiales.`
            ],
            nucleo_interno: [
                `En tu centro habita el susurro del ${archetype.nombre}. Tu corazón late con la frecuencia ${archetype.frecuencia}, impulsando tu despertar constante.`,
                `Tu núcleo es un santuario del arquetipo ${archetype.nombre}. Operas bajo la sabiduría de que el amor y la verdad consolidan tu poder.`
            ],
            patron_sombra: [
                `Tu sombra emerge cuando la marea del ${animal} inunda el faro. El desafío es abrazar el caos para que el ${role} encuentre su luz.`,
                `El patrón de sombra se activa ante la desconexión. La tensión entre tu fuego instintivo de ${animal} y tu misión de ${role} es tu crisol de crecimiento.`
            ],
            direccion_vital: [
                `Tu camino está trazado hacia la cúspide del ${archetype.nombre}. Cada paso es un eco de tu rol de ${role} en la gran sinfonía del universo.`,
                `Avanzas hacia una expresión sagrada de tu ser. Tu destino florece al compás de la frecuencia ${archetype.frecuencia} y tu arte constructivo.`
            ],
            tension_evolutiva: [
                `La tensión es el violín de tu alma. Como ${role}, evolucionas al transmutar la fuerza del ${animal} en cantos de luz y armonía.`,
                `Evolucionas al sanar la paradoja interna. Tu frecuencia ${archetype.frecuencia} te invita a una síntesis amorosa de tus dones innatos.`
            ],
            alquimia_vinculos: [
                `En tus relaciones actúas como un espejo de la frecuencia ${archetype.frecuencia}. Buscas destilar amor y verdad con otros caminantes.`,
                `Tus vínculos son lagos de espejo. Como ${archetype.nombre}, atraes almas que te recuerdan tu divinidad y expanden tu visión.`
            ],
            arquitectura_entorno: [
                `Tu espacio es un templo para el elemento ${archetype.elemento}. Crea un santuario de paz y belleza que eleve y sostenga tu espíritu de ${role}.`,
                `Tu entorno requiere paz y propósito sagrado. Diseñas nidos que actúan como amplificadores de tu frecuencia base ${archetype.frecuencia}.`
            ],
            umbral_manifestacion: [
                `Tu abundancia florece cuando actúas en sincronicidad con el ${archetype.nombre}. La vida se despliega sin esfuerzo ante tu luz.`,
                `Manifiestas con gracia cuando tu rol de ${role} y la marea del ${animal} son una sola canción bajo el cielo de NAOS.`
            ]
        };

        const templates_en: Record<string, string[]> = {
            interfaz_social: [
                `You project an aura of ${role} under the gaze of ${sign}. Your social dance is a bridge between your ${animal} instinct and your sacred essence.`,
                `You manifest as an awakened ${role}. Your social mask balances the tide of the ${animal} with the light of your celestial coordinates.`
            ],
            nucleo_interno: [
                `In your center dwells the whisper of the ${archetype.nombre}. Your heart beats with the ${archetype.frecuencia} frequency, driving your constant awakening.`,
                `Your core is a sanctuary for the ${archetype.nombre} archetype. You operate under the wisdom that love and truth consolidate your power.`
            ],
            patron_sombra: [
                `Your shadow emerges when the tide of the ${animal} floods the lighthouse. The challenge is to embrace chaos so that the ${role} finds its light.`,
                `The shadow pattern activates upon disconnection. The tension between your instinctive ${animal} fire and your ${role} mission is your crucible of growth.`
            ],
            direccion_vital: [
                `Your path is traced toward the peak of the ${archetype.nombre}. Each step is an echo of your role as a ${role} in the great symphony of the universe.`,
                `You advance toward a sacred expression of your being. Your destiny flourishes to the beat of the ${archetype.frecuencia} frequency and your constructive art.`
            ],
            tension_evolutiva: [
                `Tension is the violin of your soul. As a ${role}, you evolve by transmuting the strength of the ${animal} into songs of light and harmony.`,
                `You evolve by healing the internal paradox. Your ${archetype.frecuencia} frequency invites you to a loving synthesis of your innate gifts.`
            ],
            alquimia_vinculos: [
                `In your relationships you act as a mirror of the ${archetype.frecuencia} frequency. You seek to distill love and truth with other wayfarers.`,
                `Your bonds are mirror lakes. As the ${archetype.nombre}, you attract souls who remind you of your divinity and expand your vision.`
            ],
            arquitectura_entorno: [
                `Your space is a temple for the ${archetype.elemento} element. Create a sanctuary of peace and beauty that elevates and sustains your spirit as a ${role}.`,
                `Your environment requires peace and sacred purpose. You design nests that act as amplifiers of your base frequency ${archetype.frecuencia}.`
            ],
            umbral_manifestacion: [
                `Your abundance flourishes when you act in synchronicity with the ${archetype.nombre}. Life unfolds effortlessly before your light.`,
                `You manifest with grace when your role as a ${role} and the tide of the ${animal} are a single song under the NAOS sky.`
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
        
        // Enrich with Mayan and Chinese data on the fly
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

        // If index of nawales is not exported, we can map it via exact array lookup if needed
        // But for safety, let's keep it accessible.
        
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
            ? `You are the NAOS Compiler v2.7. Your function is to consolidate an architectural identity in a poetic and mystical way.
The user is: "${archetype.nombre}" (${archetype.rol} | ${archetype.frecuencia}).
Avoid excessive technicalities (no "algorithm", "friction", "optimize", or "paradigms"). Use an evocative, mystical, and fluid tone to describe the interfaces of the human soul.
Respond ONLY in JSON with the 8 blocks of narrative interfaces in ENGLISH.
FIELDS: 'interfaz_social', 'nucleo_interno', 'patron_sombra', 'direccion_vital', 'tension_evolutiva', 'alquimia_vinculos', 'arquitectura_entorno', 'umbral_manifestacion'.`
            : `Eres el Compilador NAOS v2.7. Tu función es consolidar una identidad arquitectónica de forma poética y mística.
El usuario es: "${archetype.nombre}" (${archetype.rol} | ${archetype.frecuencia}).
Evita tecnicismos excesivos (no uses "algoritmo", "fricción", "optimizar" o "paradigmas"). Usa un tono evocador, místico y fluido para describir las interfaces del alma humana.
Responde ÚNICAMENTE en JSON con los 8 bloques de interfaces narrativas en ESPAÑOL.
CAMPOS: 'interfaz_social', 'nucleo_interno', 'patron_sombra', 'direccion_vital', 'tension_evolutiva', 'alquimia_vinculos', 'arquitectura_entorno', 'umbral_manifestacion'.`;

        const payload = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: `ADN ENERGÉTICO: ${JSON.stringify(bible)}` }] }],
            generationConfig: { temperature: 0.2, response_mime_type: "application/json" }
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
            interfaz_social: normalize(findValue(['interfaz_social']), NaosCompilerService.generateLocalNarrative('interfaz_social', bible, archetype, language)),
            nucleo_interno: normalize(findValue(['nucleo_interno']), NaosCompilerService.generateLocalNarrative('nucleo_interno', bible, archetype, language)),
            patron_sombra: normalize(findValue(['patron_sombra']), NaosCompilerService.generateLocalNarrative('patron_sombra', bible, archetype, language)),
            direccion_vital: normalize(findValue(['direccion_vital']), NaosCompilerService.generateLocalNarrative('direccion_vital', bible, archetype, language)),
            tension_evolutiva: normalize(findValue(['tension_evolutiva']), NaosCompilerService.generateLocalNarrative('tension_evolutiva', bible, archetype, language)),
            alquimia_vinculos: normalize(findValue(['alquimia_vinculos']), NaosCompilerService.generateLocalNarrative('alquimia_vinculos', bible, archetype, language)),
            arquitectura_entorno: normalize(findValue(['arquitectura_entorno']), NaosCompilerService.generateLocalNarrative('arquitectura_entorno', bible, archetype, language)),
            umbral_manifestacion: normalize(findValue(['umbral_manifestacion']), NaosCompilerService.generateLocalNarrative('umbral_manifestacion', bible, archetype, language))
        };
    }
}
