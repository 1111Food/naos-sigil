
// server/src/modules/user/archetypeEngine.ts

export interface ArchetypeResult {
    id: string;
    nombre: string;
    frecuencia: string;
    rol: string;
    descripcion: string;
    interpretacion_profunda?: string;
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
        desc: { es: string, en: string },
        deepDesc: { es: string, en: string }
    }>> = {
        'fuego': {
            1: { 
                nombre: { es: "El Catalizador", en: "The Catalyst" }, 
                desc: { 
                    es: "La chispa primigenia que fractura la inercia; despierta el fuego dormido y abre portales de transformación profunda.",
                    en: "The primal spark that fractures inertia; awakens dormant fire and opens portals of deep transformation."
                },
                deepDesc: {
                    es: "Eres la chispa que detona el cambio. Tu energía no está diseñada para el mantenimiento, sino para la disrupción. Cuando las estructuras se estancan, tu presencia fractura la inercia. Tienes una capacidad instintiva para iniciar ciclos nuevos, pero tu desafío radica en no consumirte antes de que el fuego prenda en otros. Tu liderazgo es por explosión: inspiras a través del movimiento puro.",
                    en: "You are the spark that detonates change. Your energy is not designed for maintenance, but for disruption. When structures stagnate, your presence fractures inertia. You possess an instinctive capacity to initiate new cycles, but your challenge lies in not burning out before the fire catches in others. Your leadership is by explosion: you inspire through pure movement."
                }
            },
            2: { 
                nombre: { es: "El Forjador", en: "The Forger" }, 
                desc: { 
                    es: "Escultor de la voluntad; transmuta el calor denso en pilares sagrados, modelando la realidad con la persistencia del metal al rojo vivo.",
                    en: "Sculptor of will; transmutes dense heat into sacred pillars, shaping reality with the persistence of red-hot metal."
                },
                deepDesc: {
                    es: "Posees una voluntad de hierro capaz de moldear la realidad material a través de la pasión sostenida. No solo tienes el fuego de la visión, sino el martillo de la ejecución. Tu poder radica en tomar la inspiración pura y golpearla contra el yunque del trabajo diario hasta convertirla en estructura. Tu mayor reto es la impaciencia; debes recordar que el buen acero requiere tiempo bajo presión.",
                    en: "You possess an iron will capable of shaping material reality through sustained passion. You don't just have the fire of vision, but the hammer of execution. Your power lies in taking pure inspiration and striking it against the anvil of daily work until it becomes structure. Your greatest challenge is impatience; you must remember that good steel requires time under pressure."
                }
            },
            3: { 
                nombre: { es: "El Regente Central", en: "The Central Regent" }, 
                desc: { 
                    es: "Un sol gravitacional que lidera desde la presencia absoluta; unifica fuerzas dispersas en un mandala de propósito indivisible.",
                    en: "A gravitational sun that leads from absolute presence; unifies dispersed forces in a mandala of indivisible purpose."
                },
                deepDesc: {
                    es: "Eres un sol gravitacional. Tu magnetismo atrae a las personas y a las oportunidades hacia tu órbita. Lideras no por imposición, sino por irradiación: simplemente existiendo en tu centro de poder, organizas el caos a tu alrededor. Tu tarea evolutiva es iluminar sin quemar, aprender a delegar y permitir que otros planetas brillen en tu sistema solar sin sentir que pierdes calor.",
                    en: "You are a gravitational sun. Your magnetism draws people and opportunities into your orbit. You lead not by imposition, but by irradiation: simply by existing in your center of power, you organize the chaos around you. Your evolutionary task is to illuminate without burning, to learn to delegate, and to allow other planets to shine in your solar system without feeling you lose heat."
                }
            },
            4: { 
                nombre: { es: "El Vector", en: "The Vector" }, 
                desc: { 
                    es: "La flecha de luz que rasga el velo del mañana; avanza con la certeza del viento estelar hacia horizontes sagrados.",
                    en: "The arrow of light that tears the veil of tomorrow; advances with the certainty of stellar wind toward sacred horizons."
                },
                deepDesc: {
                    es: "Eres la mente dirigida por el instinto, la flecha en vuelo. Tu fuego no es una fogata dispersa, es un láser concentrado hacia una verdad o un objetivo lejano. Tienes la capacidad de ver más allá del horizonte inmediato y de guiar a otros hacia el futuro. El riesgo es que, en tu obsesión por el objetivo, ignores el terreno que estás pisando y a quienes caminan a tu lado.",
                    en: "You are the mind directed by instinct, the arrow in flight. Your fire is not a scattered bonfire, it is a laser focused toward a distant truth or goal. You have the ability to see beyond the immediate horizon and guide others toward the future. The risk is that, in your obsession with the goal, you ignore the ground you are walking on and those walking beside you."
                }
            }
        },
        'tierra': {
            1: { 
                nombre: { es: "El Optimizador", en: "The Optimizer" }, 
                desc: { 
                    es: "Afinador sutil de la materia; escucha el latido de los sistemas y remueve el polvo de la fricción para revelar la geometría perfecta.",
                    en: "Subtle tuner of matter; listens to the heartbeat of systems and removes the dust of friction to reveal perfect geometry."
                },
                deepDesc: {
                    es: "Tienes el don de ver la semilla de la eficiencia en el campo de la materia. Tu impulso inicial no es destruir, sino mejorar y purificar. Sabes intuitivamente qué engranaje necesita aceite y qué sistema está desperdiciando energía. Eres pragmático y orientado a resultados. Tu desafío es entender que no todo en la vida, especialmente las emociones humanas, puede o debe ser optimizado.",
                    en: "You have the gift of seeing the seed of efficiency in the field of matter. Your initial impulse is not to destroy, but to improve and purify. You intuitively know which gear needs oil and which system is wasting energy. You are pragmatic and results-oriented. Your challenge is understanding that not everything in life, especially human emotions, can or should be optimized."
                }
            },
            2: { 
                nombre: { es: "El Custodio", en: "The Custodian" }, 
                desc: { 
                    es: "Guardián de templos y memorias; sostiene la arquitectura del alma a través de los eones, anclando la divinidad en la piedra.",
                    en: "Guardian of temples and memories; sustains the soul's architecture through the eons, anchoring divinity in stone."
                },
                deepDesc: {
                    es: "Eres el guardián de la memoria, de las tradiciones y de las estructuras a largo plazo. Tu energía es como una montaña: inamovible, constante y confiable. Tienes una capacidad inmensa para sostener proyectos y comunidades a través del tiempo. Tu mayor virtud es la lealtad y la resiliencia. El peligro radica en el estancamiento; debes aprender cuándo dejar caer una estructura que ya no sirve.",
                    en: "You are the guardian of memory, of traditions, and of long-term structures. Your energy is like a mountain: unmovable, constant, and reliable. You have an immense capacity to sustain projects and communities through time. Your greatest virtue is loyalty and resilience. The danger lies in stagnation; you must learn when to let go of a structure that no longer serves."
                }
            },
            3: { 
                nombre: { es: "El Ancla", en: "The Anchor" }, 
                desc: { 
                    es: "La raíz que sostiene la montaña; un santuario de calma en la tempestad que ofrece un refugio inquebrantable a quienes orbitan su centro.",
                    en: "The root that sustains the mountain; a sanctuary of calm in the storm that offers an unshakeable refuge to those orbiting its center."
                },
                deepDesc: {
                    es: "En un mundo de caos, tú eres el suelo firme. Tu habilidad principal es proporcionar estabilidad y seguridad a los demás. Tienes un talento natural para tejer redes prácticas, creando entornos donde las personas se sienten seguras para crecer. Conectas a través de lo tangible: el refugio, el alimento, el recurso. Tu reto es no dejarte hundir por el peso emocional y material de quienes se aferran a ti.",
                    en: "In a world of chaos, you are the solid ground. Your primary ability is to provide stability and security to others. You have a natural talent for weaving practical networks, creating environments where people feel safe to grow. You connect through the tangible: shelter, food, resources. Your challenge is not letting yourself sink under the emotional and material weight of those who cling to you."
                }
            },
            4: { 
                nombre: { es: "El Arquitecto", en: "The Architect" }, 
                desc: { 
                    es: "Tejedor de lo visible; dibuja los planos de la existencia y materializa los sueños etéreos en estructuras de roca y luz.",
                    en: "Weaver of the visible; draws the blueprints of existence and materializes ethereal dreams in structures of rock and light."
                },
                deepDesc: {
                    es: "Posees la mente de un maestro constructor. No solo ves la materia, sino la geometría sagrada detrás de ella. Tienes la habilidad de planificar a décadas vista, estructurando imperios desde los cimientos hasta la cúpula. Eres meticuloso, calculador y estratégico. Tu gran prueba es la flexibilidad: cuando el terreno tiembla, el mejor arquitecto sabe cómo construir cimientos que se muevan con el sismo sin colapsar.",
                    en: "You possess the mind of a master builder. You don't just see matter, but the sacred geometry behind it. You have the ability to plan decades ahead, structuring empires from the foundations to the dome. You are meticulous, calculating, and strategic. Your great test is flexibility: when the ground shakes, the best architect knows how to build foundations that move with the quake without collapsing."
                }
            }
        },
        'aire': {
            1: { 
                nombre: { es: "El Ingeniero de Paradigmas", en: "The Paradigm Engineer" }, 
                desc: { 
                    es: "El susurro que deconstruye el dogma; un explorador que abre las jaulas de la mente e introduce aire fresco en el software del alma.",
                    en: "The whisper that deconstructs dogma; an explorer who opens the cages of the mind and introduces fresh air into the soul's software."
                },
                deepDesc: {
                    es: "Tu mente es un viento revolucionario que barre con las viejas creencias. No estás aquí para mejorar el sistema existente, sino para proponer una nueva forma de pensar. Tu chispa es intelectual: detonas ideas, innovaciones y nuevas perspectivas. Eres rápido y desapegado. Tu desafío es lograr que tus conceptos aterricen en la realidad material y no se queden flotando como castillos en el aire.",
                    en: "Your mind is a revolutionary wind that sweeps away old beliefs. You are not here to improve the existing system, but to propose a new way of thinking. Your spark is intellectual: you detonate ideas, innovations, and new perspectives. You are quick and detached. Your challenge is making your concepts land in material reality and not remain floating as castles in the air."
                }
            },
            2: { 
                nombre: { es: "El Decodificador", en: "The Decoder" }, 
                desc: { 
                    es: "Traductor del viento estelar; un procesador de verdades que desentraña el murmullo del cosmos para revelar los patrones eternos.",
                    en: "Translator of stellar wind; a processor of truths that unravels the cosmic murmur to reveal eternal patterns."
                },
                deepDesc: {
                    es: "Tienes la capacidad de estructurar el conocimiento. Tomas la vastedad de la información, el caos de los datos, y los traduces en sistemas comprensibles. Eres el puente entre el misterio y la razón. Construyes con ideas, formulando teorías, lenguajes o metodologías sólidas. Tu riesgo es quedar atrapado en el laberinto de tu propia lógica, olvidando que la vida a veces es irracional y puramente emocional.",
                    en: "You have the ability to structure knowledge. You take the vastness of information, the chaos of data, and translate them into comprehensible systems. You are the bridge between mystery and reason. You build with ideas, formulating robust theories, languages, or methodologies. Your risk is getting trapped in the labyrinth of your own logic, forgetting that life is sometimes irrational and purely emotional."
                }
            },
            3: { 
                nombre: { es: "El Nodo", en: "The Node" }, 
                desc: { 
                    es: "Tejedor de constelaciones humanas; orquesta encuentros sagrados y entrelaza hilos invisibles en el momento de máxima resonancia.",
                    en: "Weaver of human constellations; orchestrates sacred encounters and intertwines invisible threads at the moment of maximum resonance."
                },
                deepDesc: {
                    es: "Eres el tejido conectivo de la sociedad, la sinapsis por donde viaja la información. Tu talento radica en unir mentes, conceptos y personas que de otra manera jamás se cruzarían. Eres un facilitador de sincronicidades, el mensajero del aire. Tu reto evolutivo es encontrar tu propia voz y tu propio centro en medio de tanto ruido externo, evitando la dispersión y la superficialidad.",
                    en: "You are the connective tissue of society, the synapse through which information travels. Your talent lies in uniting minds, concepts, and people who would otherwise never cross paths. You are a facilitator of synchronicities, the messenger of the air. Your evolutionary challenge is finding your own voice and center amidst so much external noise, avoiding dispersion and superficiality."
                }
            },
            4: { 
                nombre: { es: "El Observador", en: "The Observer" }, 
                desc: { 
                    es: "Una mirada que flota sobre la bruma; se eleva sobre el laberinto de la ilusión para contemplar las corrientes eternas del destino.",
                    en: "A gaze that floats above the mist; soars above the labyrinth of illusion to contemplate the eternal currents of destiny."
                },
                deepDesc: {
                    es: "Tu mente es como un águila que vuela por encima de la tormenta. Tienes la habilidad de ver los patrones cósmicos, sociales o psicológicos sin involucrarte emocionalmente. Esta perspectiva panorámica te otorga una objetividad casi sobrenatural. Sin embargo, el peligro de mirar desde tan alto es la desconexión; debes recordar que para experimentar verdaderamente la vida, debes bajar y ensuciarte las manos.",
                    en: "Your mind is like an eagle soaring above the storm. You have the ability to see cosmic, social, or psychological patterns without emotional involvement. This panoramic perspective grants you an almost supernatural objectivity. However, the danger of looking from so high is disconnection; you must remember that to truly experience life, you must come down and get your hands dirty."
                }
            }
        },
        'agua': {
            1: { 
                nombre: { es: "El Transmutador", en: "The Transmuter" }, 
                desc: { 
                    es: "Alquimista que danza en el abismo; desciende a las aguas más oscuras para emerger con el oro de la sabiduría y la renovación.",
                    en: "Alchemist dancing in the abyss; descends into the darkest waters to emerge with the gold of wisdom and renewal."
                },
                deepDesc: {
                    es: "Eres el catalizador emocional. Tienes la rara habilidad de descender a las profundidades de la psique, tuya y de otros, y provocar catarsis. Inicias ciclos a través del sentir, rompiendo diques emocionales represados para que el agua fluya de nuevo. Eres intenso y magnético. Tu prueba máxima es no ahogarte en las corrientes de dolor o drama que desatas, aprendiendo a ser el cauce y no solo la inundación.",
                    en: "You are the emotional catalyst. You have the rare ability to descend into the depths of the psyche, yours and others', and provoke catharsis. You initiate cycles through feeling, breaking repressed emotional dams so water flows again. You are intense and magnetic. Your ultimate test is not drowning in the currents of pain or drama you unleash, learning to be the riverbed and not just the flood."
                }
            },
            2: { 
                nombre: { es: "El Sismógrafo", en: "The Seismograph" }, 
                desc: { 
                    es: "Un faro en la niebla que siente la pulsación del océano invisible; decodifica el eco de las almas y devela la verdad que el silencio intenta ocultar.",
                    en: "A lighthouse in the fog that feels the pulsation of the invisible ocean; decodes the echo of souls and reveals the truth that silence tries to hide."
                },
                deepDesc: {
                    es: "Construyes tu mundo basándote en la intuición y la percepción profunda de lo invisible. Tienes una sensibilidad extrema para detectar las vibraciones sutiles, los secretos y las verdades ocultas detrás de las fachadas. Utilizas esta sensibilidad para crear vínculos y dinámicas basadas en la verdad emocional absoluta. Tu reto es aprender a poner límites, pues absorber las emociones del entorno puede envenenar tu propia agua.",
                    en: "You build your world based on intuition and profound perception of the invisible. You have extreme sensitivity to detect subtle vibrations, secrets, and hidden truths behind facades. You use this sensitivity to create bonds and dynamics based on absolute emotional truth. Your challenge is learning to set boundaries, as absorbing the emotions of the environment can poison your own water."
                }
            },
            3: { 
                nombre: { es: "El Espejo", en: "The Mirror" }, 
                desc: { 
                    es: "Un estanque de agua cristalina que devuelve al caminante una imagen nítida de su grandeza y de las sombras que aún debe abrazar.",
                    en: "A pond of crystalline water that returns to the wayfarer a sharp image of their greatness and the shadows they must still embrace."
                },
                deepDesc: {
                    es: "Tienes una capacidad empática sin igual. Eres capaz de fusionarte con la esencia del otro, reflejando su luz y su sombra con total fidelidad. Conectas a nivel del alma, sanando a través de la presencia pura y la aceptación incondicional. El gran desafío de tu arquetipo es no perder tu propia forma geométrica al tomar la forma del recipiente que te contiene; debes recordar quién eres cuando nadie se está mirando en ti.",
                    en: "You have an unparalleled empathic capacity. You are able to merge with the essence of the other, reflecting their light and shadow with complete fidelity. You connect at the soul level, healing through pure presence and unconditional acceptance. The great challenge of your archetype is not losing your own geometric shape by taking the shape of the container that holds you; you must remember who you are when no one is looking in you."
                }
            },
            4: { 
                nombre: { es: "El Navegante", en: "The Navigator" }, 
                desc: { 
                    es: "El timonel del mundo onírico; se desplaza con gracia por los mares del inconsciente, cartografiando las profundidades del alma.",
                    en: "The helmsman of the dream world; moves with grace through the seas of the unconscious, mapping the depths of the soul."
                },
                deepDesc: {
                    es: "Eres el explorador de los océanos inconscientes y los reinos oníricos. Tienes una sabiduría innata, casi ancestral, que trasciende la lógica lineal. Entiendes la vida a través de los símbolos, los sueños y la intuición profunda. Tu tarea es cartografiar lo incognoscible y guiar a otros a través de la oscuridad. Tu riesgo es el escapismo: preferir los mundos sutiles y olvidar anclar tus descubrimientos en el mundo real.",
                    en: "You are the explorer of unconscious oceans and dream realms. You have innate, almost ancestral wisdom that transcends linear logic. You understand life through symbols, dreams, and deep intuition. Your task is to map the unknowable and guide others through the darkness. Your risk is escapism: preferring subtle worlds and forgetting to anchor your discoveries in the real world."
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
                id: `${finalElement}-${roleId}`,
                nombre: isEn ? archetypeEntry.nombre.en : archetypeEntry.nombre.es,
                frecuencia: frecuenciaMap[finalElement],
                rol: roleNameMap[roleId as 1|2|3|4] || (isEn ? 'Initiator' : 'Iniciador'),
                descripcion: isEn ? archetypeEntry.desc.en : archetypeEntry.desc.es,
                interpretacion_profunda: isEn ? archetypeEntry.deepDesc?.en : archetypeEntry.deepDesc?.es,
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
                id: "aire-4", // The Observer as default fallback
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
