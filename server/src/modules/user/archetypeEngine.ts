
// server/src/modules/user/archetypeEngine.ts

export interface ArchetypeResult {
    nombre: string;
    frecuencia: string;
    rol: string;
    descripcion: string;
    elemento_dominante: 'fuego' | 'tierra' | 'aire' | 'agua';
    powerLines?: any[];
    desglose?: {
        scores: Record<string, number>;
        contribuciones: {
            astrologia: string[];
            maya: string[];
            chino: string[];
            numerologia: string[];
        }
    }
}

export class ArchetypeEngine {
    private static SIGNS_TO_ELEMENT: Record<string, 'fuego' | 'tierra' | 'aire' | 'agua'> = {
        'Aries': 'fuego', 'Leo': 'fuego', 'Sagittarius': 'fuego',
        'Taurus': 'tierra', 'Virgo': 'tierra', 'Capricorn': 'tierra',
        'Gemini': 'aire', 'Libra': 'aire', 'Aquarius': 'aire',
        'Cancer': 'agua', 'Scorpio': 'agua', 'Pisces': 'agua'
    };

    private static MAYAN_COLORS_TO_ELEMENT: Record<string, 'fuego' | 'tierra' | 'aire' | 'agua'> = {
        'Rojo': 'fuego', 'Amarillo': 'tierra', 'Blanco': 'aire', 'Azul': 'agua'
    };

    private static CHINESE_TO_ELEMENT: Record<string, 'fuego' | 'tierra' | 'aire' | 'agua'> = {
        'Fuego': 'fuego', 'Agua': 'agua', 'Tierra': 'tierra', 'Metal': 'aire', 'Madera': 'tierra'
    };

    private static ARCHETYPE_MATRIX: Record<string, Record<number, { 
        nombre: { es: string, en: string }, 
        desc: { es: string, en: string } 
    }>> = {
        'fuego': {
            1: { 
                nombre: { es: "El Catalizador", en: "The Catalyst" }, 
                desc: { 
                    es: "La chispa primigenia que fractura la inercia; despierta el fuego dormido y abre portales de transformación profunda.",
                    en: "The primal spark that fractures inertia; awakens dormant fire and opens portals of deep transformation."
                } 
            },
            2: { 
                nombre: { es: "El Forjador", en: "The Forger" }, 
                desc: { 
                    es: "Escultor de la voluntad; transmuta el calor denso en pilares sagrados, modelando la realidad con la persistencia del metal al rojo vivo.",
                    en: "Sculptor of will; transmutes dense heat into sacred pillars, shaping reality with the persistence of red-hot metal."
                } 
            },
            3: { 
                nombre: { es: "El Regente Central", en: "The Central Regent" }, 
                desc: { 
                    es: "Un sol gravitacional que lidera desde la presencia absoluta; unifica fuerzas dispersas en un mandala de propósito indivisible.",
                    en: "A gravitational sun that leads from absolute presence; unifies dispersed forces in a mandala of indivisible purpose."
                } 
            },
            4: { 
                nombre: { es: "El Vector", en: "The Vector" }, 
                desc: { 
                    es: "La flecha de luz que rasga el velo del mañana; avanza con la certeza del viento estelar hacia horizontes sagrados.",
                    en: "The arrow of light that tears the veil of tomorrow; advances with the certainty of stellar wind toward sacred horizons."
                } 
            }
        },
        'tierra': {
            1: { 
                nombre: { es: "El Optimizador", en: "The Optimizer" }, 
                desc: { 
                    es: "Afinador sutil de la materia; escucha el latido de los sistemas y remueve el polvo de la fricción para revelar la geometría perfecta.",
                    en: "Subtle tuner of matter; listens to the heartbeat of systems and removes the dust of friction to reveal perfect geometry."
                } 
            },
            2: { 
                nombre: { es: "El Custodio", en: "The Custodian" }, 
                desc: { 
                    es: "Guardián de templos y memorias; sostiene la arquitectura del alma a través de los eones, anclando la divinidad en la piedra.",
                    en: "Guardian of temples and memories; sustains the soul's architecture through the eons, anchoring divinity in stone."
                } 
            },
            3: { 
                nombre: { es: "El Ancla", en: "The Anchor" }, 
                desc: { 
                    es: "La raíz que sostiene la montaña; un santuario de calma en la tempestad que ofrece un refugio inquebrantable a quienes orbitan su centro.",
                    en: "The root that sustains the mountain; a sanctuary of calm in the storm that offers an unshakeable refuge to those orbiting its center."
                } 
            },
            4: { 
                nombre: { es: "El Arquitecto", en: "The Architect" }, 
                desc: { 
                    es: "Tejedor de lo visible; dibuja los planos de la existencia y materializa los sueños etéreos en estructuras de roca y luz.",
                    en: "Weaver of the visible; draws the blueprints of existence and materializes ethereal dreams in structures of rock and light."
                } 
            }
        },
        'aire': {
            1: { 
                nombre: { es: "El Ingeniero de Paradigmas", en: "The Paradigm Engineer" }, 
                desc: { 
                    es: "El susurro que deconstruye el dogma; un explorador que abre las jaulas de la mente e introduce aire fresco en el software del alma.",
                    en: "The whisper that deconstructs dogma; an explorer who opens the cages of the mind and introduces fresh air into the soul's software."
                } 
            },
            2: { 
                nombre: { es: "El Decodificador", en: "The Decoder" }, 
                desc: { 
                    es: "Traductor del viento estelar; un procesador de verdades que desentraña el murmullo del cosmos para revelar los patrones eternos.",
                    en: "Translator of stellar wind; a processor of truths that unravels the cosmic murmur to reveal eternal patterns."
                } 
            },
            3: { 
                nombre: { es: "El Nodo", en: "The Node" }, 
                desc: { 
                    es: "Tejedor de constelaciones humanas; orquesta encuentros sagrados y entrelaza hilos invisibles en el momento de máxima resonancia.",
                    en: "Weaver of human constellations; orchestrates sacred encounters and intertwines invisible threads at the moment of maximum resonance."
                } 
            },
            4: { 
                nombre: { es: "El Observador", en: "The Observer" }, 
                desc: { 
                    es: "Una mirada que flota sobre la bruma; se eleva sobre el laberinto de la ilusión para contemplar las corrientes eternas del destino.",
                    en: "A gaze that floats above the mist; soars above the labyrinth of illusion to contemplate the eternal currents of destiny."
                } 
            }
        },
        'agua': {
            1: { 
                nombre: { es: "El Transmutador", en: "The Transmuter" }, 
                desc: { 
                    es: "Alquimista que danza en el abismo; desciende a las aguas más oscuras para emerger con el oro de la sabiduría y la renovación.",
                    en: "Alchemist dancing in the abyss; descends into the darkest waters to emerge with the gold of wisdom and renewal."
                } 
            },
            2: { 
                nombre: { es: "El Sismógrafo", en: "The Seismograph" }, 
                desc: { 
                    es: "Un faro en la niebla que siente la pulsación del océano invisible; decodifica el eco de las almas y devela la verdad que el silencio intenta ocultar.",
                    en: "A lighthouse in the fog that feels the pulsation of the invisible ocean; decodes the echo of souls and reveals the truth that silence tries to hide."
                } 
            },
            3: { 
                nombre: { es: "El Espejo", en: "The Mirror" }, 
                desc: { 
                    es: "Un estanque de agua cristalina que devuelve al caminante una imagen nítida de su grandeza y de las sombras que aún debe abrazar.",
                    en: "A pond of crystalline water that returns to the wayfarer a sharp image of their greatness and the shadows they must still embrace."
                } 
            },
            4: { 
                nombre: { es: "El Navegante", en: "The Navigator" }, 
                desc: { 
                    es: "El timonel del mundo onírico; se desplaza con gracia por los mares del inconsciente, cartografiando las profundidades del alma.",
                    en: "The helmsman of the dream world; moves with grace through the seas of the unconscious, mapping the depths of the soul."
                } 
            }
        }
    };


    static calculate(profile: any, language: 'es' | 'en' = 'es'): ArchetypeResult {
        const isEn = language === 'en';
        try {
            const scores = { fuego: 0, tierra: 0, aire: 0, agua: 0 };
            const normalizeSign = (sign: string) => {
                if (!sign) return null;
                const mapped = this.SIGNS_TO_ELEMENT[sign];
                if (mapped) return mapped;
                const entry = Object.entries(this.SIGNS_TO_ELEMENT).find(([k]) => k.toLowerCase() === sign.toLowerCase());
                return entry ? entry[1] : null;
            };

            const contribuciones = {
                astrologia: [] as string[],
                maya: [] as string[],
                chino: [] as string[],
                numerologia: [] as string[]
            };

            const astro = profile.astrology || {};
            const sunElem = normalizeSign(astro.sun?.sign || astro.sunSign);
            const moonElem = normalizeSign(astro.moon?.sign || astro.moonSign);
            const risingElem = normalizeSign(astro.rising?.sign || astro.risingSign);

            if (sunElem) { scores[sunElem] += 3; contribuciones.astrologia.push(`${isEn ? 'Sun in' : 'Sol en'} ${astro.sun?.sign || astro.sunSign} (+3 ${sunElem})`); }
            if (moonElem) { scores[moonElem] += 2; contribuciones.astrologia.push(`${isEn ? 'Moon in' : 'Luna en'} ${astro.moon?.sign || astro.moonSign} (+2 ${moonElem})`); }
            if (risingElem) { scores[risingElem] += 2; contribuciones.astrologia.push(`${isEn ? 'Ascendant in' : 'Ascendente en'} ${astro.rising?.sign || astro.risingSign} (+2 ${risingElem})`); }

            const nahualColor = profile.mayan?.color; 
            if (nahualColor && this.MAYAN_COLORS_TO_ELEMENT[nahualColor]) {
                const elem = this.MAYAN_COLORS_TO_ELEMENT[nahualColor];
                scores[elem] += 3;
                contribuciones.maya.push(`${isEn ? 'Nawal Color' : 'Color del Nawal'} ${nahualColor} (+3 ${elem})`);
            }

            const chineseElement = profile.chinese?.element;
            if (chineseElement && this.CHINESE_TO_ELEMENT[chineseElement]) {
                const elem = this.CHINESE_TO_ELEMENT[chineseElement];
                scores[elem] += 2; // Increased weight for Chinese Element to make it fully operative
                contribuciones.chino.push(`${isEn ? 'Chinese Element' : 'Elemento Chino'} ${chineseElement} (+2 ${elem})`);
            }

            let finalElement: 'fuego' | 'tierra' | 'aire' | 'agua' = 'fuego';
            const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
            if (sorted[0][1] > 0) finalElement = sorted[0][0] as any;
            else if (sunElem) finalElement = sunElem;
            
            const frecuenciaMap = isEn 
                ? { fuego: 'Igneous', tierra: 'Telluric', aire: 'Ethereal', agua: 'Abyssal' }
                : { fuego: 'Ígnea', tierra: 'Telúrica', aire: 'Etérea', agua: 'Abisal' };

            const lifePath = profile.numerology?.lifePathNumber || 1;
            let roleId = 1; 
            if ([1, 5].includes(lifePath)) { 
                roleId = 1; 
                contribuciones.numerologia.push(isEn ? `Life Vibration ${lifePath} -> Initiator` : `Vibración de Vida ${lifePath} -> Iniciador`); 
            }
            else if ([4, 8, 22].includes(lifePath)) { 
                roleId = 2; 
                contribuciones.numerologia.push(isEn ? `Life Vibration ${lifePath} -> Constructor` : `Vibración de Vida ${lifePath} -> Constructor`); 
            }
            else if ([2, 3, 6].includes(lifePath)) { 
                roleId = 3; 
                contribuciones.numerologia.push(isEn ? `Life Vibration ${lifePath} -> Connector` : `Vibración de Vida ${lifePath} -> Conector`); 
            }
            else if ([7, 9, 11, 33].includes(lifePath)) { 
                roleId = 4; 
                contribuciones.numerologia.push(isEn ? `Life Vibration ${lifePath} -> Analyst` : `Vibración de Vida ${lifePath} -> Analista`); 
            }

            const roleNameMap = isEn
                ? { 1: 'Initiator', 2: 'Constructor', 3: 'Connector', 4: 'Analyst' }
                : { 1: 'Iniciador', 2: 'Constructor', 3: 'Conector', 4: 'Analista' };

            const archetypeEntry = this.ARCHETYPE_MATRIX[finalElement][roleId] || { 
                nombre: { es: "El Arquitecto", en: "The Architect" }, 
                desc: { 
                    es: "Diseña y sostiene el plano de la realidad material con precisión absoluta.",
                    en: "Designs and sustains the plane of material reality with absolute precision."
                } 
            };

            const result: ArchetypeResult = {
                nombre: isEn ? archetypeEntry.nombre.en : archetypeEntry.nombre.es,
                frecuencia: frecuenciaMap[finalElement],
                rol: roleNameMap[roleId as 1|2|3|4] || (isEn ? 'Initiator' : 'Iniciador'),
                descripcion: isEn ? archetypeEntry.desc.en : archetypeEntry.desc.es,
                elemento_dominante: finalElement,
                desglose: {
                    scores: { ...scores },
                    contribuciones
                }
            };

            // Astrocartografía Simplificada: Líneas de Poder
            if (astro.planets && (astro.ascendant !== undefined || astro.rising?.absDegree !== undefined)) {
                result.powerLines = this.calculatePowerLines(astro, language);
            }

            return result;
        } catch (err) {
            console.error("🔥 ArchetypeEngine Error:", err);
            return {
                nombre: isEn ? "The Silent Architect" : "El Arquitecto Silencioso",
                frecuencia: isEn ? "Ethereal" : "Etérea",
                rol: isEn ? "Analyst" : "Analista",
                descripcion: isEn ? "Observes patterns from silence, waiting for the right alignment." : "Observa los patrones desde el silencio, esperando la alineación correcta.",
                elemento_dominante: "aire"
            };
        }
    }

    private static calculatePowerLines(astro: any, language: 'es' | 'en' = 'es'): any[] {
        const isEn = language === 'en';
        const planets = astro.planets || [];
        const asc = astro.rising?.absDegree || astro.ascendant || 0;
        const mc = astro.midheaven || 0;
        const dc = (asc + 180) % 360;
        const ic = (mc + 180) % 360;

        const angles = isEn ? [
            { name: 'Ascendant (AC)', deg: asc, desc: 'Identity and Projection' },
            { name: 'Descendant (DC)', deg: dc, desc: 'Bonds and Mirrors' },
            { name: 'Midheaven (MC)', deg: mc, desc: 'Mission and Power' },
            { name: 'Imum Coeli (IC)', deg: ic, desc: 'Roots and Refuge' }
        ] : [
            { name: 'Ascendente (AC)', deg: asc, desc: 'Identidad y Proyección' },
            { name: 'Descendente (DC)', deg: dc, desc: 'Vínculos y Espejos' },
            { name: 'Medio Cielo (MC)', deg: mc, desc: 'Misión y Poder' },
            { name: 'Fondo del Cielo (IC)', deg: ic, desc: 'Raíces y Refugio' }
        ];

        const powerLines: any[] = [];
        const ORB = 8;

        planets.forEach((p: any) => {
            angles.forEach(angle => {
                let diff = Math.abs(p.absDegree - angle.deg);
                if (diff > 180) diff = 360 - diff;
                if (diff <= ORB) {
                    powerLines.push({
                        planeta: p.name,
                        angulo: angle.name,
                        distancia: Math.round(diff * 100) / 100,
                        significado: isEn 
                            ? `${p.name} on the ${angle.name} intensifies your ${angle.desc.toLowerCase()}.`
                            : `${p.name} en el ${angle.name} intensifica tu ${angle.desc.toLowerCase()}.`
                    });
                }
            });
        });

        return powerLines;
    }
}
