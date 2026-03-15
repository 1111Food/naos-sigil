
import { config } from '../../config/env';
import { UserProfile } from '../../types';
import { ChineseAstrology } from '../../utils/chineseAstrology';
import { MayanCalculator, NAWALES } from '../../utils/mayaCalculator';
import { NumerologyService } from '../../modules/numerology/service';
import { AstrologyService } from '../astrology/astroService';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { UserService } from './service';
import { ArchetypeEngine, ArchetypeResult } from './archetypeEngine';

const supabase = createClient(config.SUPABASE_URL || '', config.SUPABASE_ANON_KEY || '');

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
                `Proyectas una presencia de ${role} bajo la influencia de ${sign}. Tu interacción social está marcada por la búsqueda de equilibrio entre tu instinto de ${animal} y tu rol arquitectónico.`,
                `Te manifiestas en el mundo como un ${role} consciente. Tu máscara social equilibra la fuerza del ${animal} con la precisión de tus coordenadas de nacimiento.`
            ],
            nucleo_interno: [
                `En tu centro habita el poder del ${archetype.nombre}. Tu motor interno procesa la realidad a través de la frecuencia ${archetype.frecuencia}, impulsando tu evolución constante.`,
                `Tu núcleo está definido por el arquetipo ${archetype.nombre}. Operas bajo una lógica de ${archetype.descripcion} consolidando tu poder personal.`
            ],
            patron_sombra: [
                `Tu sombra emerge cuando la energía del ${animal} se desborda o se reprime. El desafío es integrar los impulsos reactivos para que el ${role} mantenga el mando.`,
                `El patrón de sombra se activa ante la falta de coherencia. La tensión entre tu naturaleza de ${animal} y tu propósito de ${role} marca tu umbral de crecimiento.`
            ],
            direccion_vital: [
                `Tu camino está trazado hacia la maestría del arquetipo ${archetype.nombre}. Cada paso que das refuerza tu rol de ${role} en la arquitectura del nuevo paradigma.`,
                `Avanzas hacia una manifestación ígnea de tu propósito. La dirección de tu vida está alineada con la frecuencia ${archetype.frecuencia} y tu misión constructiva.`
            ],
            tension_evolutiva: [
                `La tensión surge al balancear tu instinto y tu consciencia. Como ${role}, tu evolución depende de cómo transmutas la energía del ${animal} en estructuras sólidas.`,
                `Evolucionas mediante la resolución de la paradoja interna. Tu frecuencia ${archetype.frecuencia} te exige una síntesis constante de tus facultades innatas.`
            ],
            alquimia_vinculos: [
                `En tus relaciones, actúas como un espejo de la frecuencia ${archetype.frecuencia}. Buscas alquimia con otros iniciadores para potenciar tu alcance como ${role}.`,
                `Tus vínculos son laboratorios de crecimiento. Como ${archetype.nombre}, atraes espejos que desafían y expanden tu visión del mundo.`
            ],
            arquitectura_entorno: [
                `Diseñas tu espacio para que resuene con el elemento ${archetype.elemento}. Tu entorno debe ser un santuario que potencie tu capacidad de ${role}.`,
                `Tu arquitectura personal requiere orden y propósito. Creas entornos que actúan como amplificadores de tu frecuencia base ${archetype.frecuencia}.`
            ],
            umbral_manifestacion: [
                `Tu umbral de éxito se expande cuando actúas con la coherencia del ${archetype.nombre}. La manifestación es el resultado natural de tu alineación solar.`,
                `Manifiestas con facilidad cuando tu rol de ${role} y tu instinto de ${animal} operan en sincronía total bajo el código NAOS.`
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

        const systemPrompt = `Eres el Compilador NAOS v2.7. Tu función es consolidar una identidad arquitectónica.
El usuario es: "${archetype.nombre}" (${archetype.rol} | ${archetype.frecuencia}).
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
            const { error: columnError } = await supabase.from('profiles').update({ naos_identity_code: synthesis }).eq('id', userId);
            if (columnError) {
                const { data: current } = await supabase.from('profiles').select('profile_data').eq('id', userId).maybeSingle();
                const updatedData = { ...(current?.profile_data || {}), naos_identity_code: synthesis };
                await supabase.from('profiles').update({ profile_data: updatedData }).eq('id', userId);
            }
        } catch (e) {}
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
