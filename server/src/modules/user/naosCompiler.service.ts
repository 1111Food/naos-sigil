
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
    private static TARGET_MODEL = "gemini-2.0-flash";
    private static API_VERSION = "v1beta";

    static async compile(userId: string, forceRefresh = false): Promise<NaosIdentitySynthesis> {
        console.log(`[NAOS_COMPILER_v2.7+] Incoming request for ${userId} (Force: ${forceRefresh})`);
        const userProfile = await this.getCompleteProfile(userId);
        const { bible, archetype } = await this.consolidateBible(userProfile);

        if (!forceRefresh) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('naos_identity_code, profile_data')
                .eq('id', userId)
                .maybeSingle();

            let cachedCode = profile?.naos_identity_code || profile?.profile_data?.naos_identity_code;

            if (cachedCode) {
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
            console.log(`🚀 NaosCompiler: Starting full compilation for ${userId}...`);
            const synthesis = await this.callGeminiCompiler(bible, archetype, userId);

            const isValid = Object.entries(synthesis).every(([k, v]) => {
                if (k === 'arquetipo') return true;
                return v && v.length > 50 && !v.includes("...");
            });

            if (isValid) {
                await this.persistSynthesis(userId, synthesis);
            }
            
            const finalSynthesis = {
                ...synthesis,
                arquetipo: {
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
                            repaired[key] = NaosCompilerService.generateLocalNarrative(key, bible, archetype);
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
                keys.forEach(k => { fallback[k] = NaosCompilerService.generateLocalNarrative(k, bible, archetype); });
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

    private static generateLocalNarrative(id: string, bible: any, archetype: any): string {
        const sign = bible.astrology?.sun || 'Leo';
        const animal = bible.chinese_animal || 'Dragón';
        const role = archetype.rol;
        
        const templates: Record<string, string[]> = {
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

        const list = templates[id] || [`Sincronizando la frecuencia de ${archetype.nombre} en el campo de manifestación.`];
        return list[Math.floor(Math.random() * list.length)];
    }

    private static async getCompleteProfile(userId: string): Promise<any> {
        return await UserService.getProfile(userId);
    }

    private static async consolidateBible(profile: any) {
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
            archetype = ArchetypeEngine.calculate(enrichedProfile);
        } catch (engineError) {
            archetype = {
                nombre: "El Viajero de NAOS",
                frecuencia: "Etérea",
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

    private static async callGeminiCompiler(bible: any, archetype: any, userId?: string): Promise<NaosIdentitySynthesis> {
        const apiKey = config.GOOGLE_API_KEY;
        const url = `https://generativelanguage.googleapis.com/${this.API_VERSION}/models/${this.TARGET_MODEL}:generateContent?key=${apiKey}`;

        const systemPrompt = `Eres el Compilador NAOS v2.7. Tu función es consolidar una identidad arquitectónica de forma poética y mística.
El usuario es: "${archetype.nombre}" (${archetype.rol} | ${archetype.frecuencia}).
Evita tecnicismos excesivos (no uses "algoritmo", "fricción", "optimizar" o "paradigmas"). Usa un tono evocador, místico y fluido para describir las interfaces del alma humana.
Responde ÚNICAMENTE en JSON con los 8 bloques de interfaces narrativas.
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
            const normalized = this.normalizeSynthesis(rawJson, bible, archetype);
            
            return {
                ...normalized,
                arquetipo: {
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

    private static normalizeSynthesis(raw: any, bible: any, archetype: any): Omit<NaosIdentitySynthesis, 'arquetipo'> {
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
            interfaz_social: normalize(findValue(['interfaz_social']), NaosCompilerService.generateLocalNarrative('interfaz_social', bible, archetype)),
            nucleo_interno: normalize(findValue(['nucleo_interno']), NaosCompilerService.generateLocalNarrative('nucleo_interno', bible, archetype)),
            patron_sombra: normalize(findValue(['patron_sombra']), NaosCompilerService.generateLocalNarrative('patron_sombra', bible, archetype)),
            direccion_vital: normalize(findValue(['direccion_vital']), NaosCompilerService.generateLocalNarrative('direccion_vital', bible, archetype)),
            tension_evolutiva: normalize(findValue(['tension_evolutiva']), NaosCompilerService.generateLocalNarrative('tension_evolutiva', bible, archetype)),
            alquimia_vinculos: normalize(findValue(['alquimia_vinculos']), NaosCompilerService.generateLocalNarrative('alquimia_vinculos', bible, archetype)),
            arquitectura_entorno: normalize(findValue(['arquitectura_entorno']), NaosCompilerService.generateLocalNarrative('arquitectura_entorno', bible, archetype)),
            umbral_manifestacion: normalize(findValue(['umbral_manifestacion']), NaosCompilerService.generateLocalNarrative('umbral_manifestacion', bible, archetype))
        };
    }
}
