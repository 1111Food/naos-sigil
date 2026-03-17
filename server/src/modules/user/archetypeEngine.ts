
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

    private static ARCHETYPE_MATRIX: Record<string, Record<number, { nombre: string, desc: string }>> = {
        'fuego': {
            1: { nombre: "El Catalizador", desc: "La chispa primigenia que fractura la inercia; despierta el fuego dormido y abre portales de transformación profunda." },
            2: { nombre: "El Forjador", desc: "Escultor de la voluntad; transmuta el calor denso en pilares sagrados, modelando la realidad con la persistencia del metal al rojo vivo." },
            3: { nombre: "El Regente Central", desc: "Un sol gravitacional que lidera desde la presencia absoluta; unifica fuerzas dispersas en un mandala de propósito indivisible." },
            4: { nombre: "El Vector", desc: "La flecha de luz que rasga el velo del mañana; avanza con la certeza del viento estelar hacia horizontes sagrados." }
        },
        'tierra': {
            1: { nombre: "El Optimizador", desc: "Afinador sutil de la materia; escucha el latido de los sistemas y remueve el polvo de la fricción para revelar la geometría perfecta." },
            2: { nombre: "El Custodio", desc: "Guardián de templos y memorias; sostiene la arquitectura del alma a través de los eones, anclando la divinidad en la piedra." },
            3: { nombre: "El Ancla", desc: "La raíz que sostiene la montaña; un santuario de calma en la tempestad que ofrece un refugio inquebrantable a quienes orbitan su centro." },
            4: { nombre: "El Arquitecto", desc: "Tejedor de lo visible; dibuja los planos de la existencia y materializa los sueños etéreos en estructuras de roca y luz." }
        },
        'aire': {
            1: { nombre: "El Ingeniero de Paradigmas", desc: "El susurro que deconstruye el dogma; un explorador que abre las jaulas de la mente e introduce aire fresco en el software del alma." },
            2: { nombre: "El Decodificador", desc: "Traductor del viento estelar; un procesador de verdades que desentraña el murmullo del cosmos para revelar los patrones eternos." },
            3: { nombre: "El Nodo", desc: "Tejedor de constelaciones humanas; orquesta encuentros sagrados y entrelaza hilos invisibles en el momento de máxima resonancia." },
            4: { nombre: "El Observador", desc: "Una mirada que flota sobre la bruma; se eleva sobre el laberinto de la ilusión para contemplar las corrientes eternas del destino." }
        },
        'agua': {
            1: { nombre: "El Transmutador", desc: "Alquimista que danza en el abismo; desciende a las aguas más oscuras para emerger con el oro de la sabiduría y la renovación." },
            2: { nombre: "El Sismógrafo", desc: "Un faro en la niebla que siente la pulsación del océano invisible; decodifica el eco de las almas y devela la verdad que el silencio intenta ocultar." },
            3: { nombre: "El Espejo", desc: "Un estanque de agua cristalina que devuelve al caminante una imagen nítida de su grandeza y de las sombras que aún debe abrazar." },
            4: { nombre: "El Navegante", desc: "El timonel del mundo onírico; se desplaza con gracia por los mares del inconsciente, cartografiando las profundidades del alma." }
        }
    };


    static calculate(profile: any): ArchetypeResult {
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

            if (sunElem) { scores[sunElem] += 3; contribuciones.astrologia.push(`Sol en ${astro.sun?.sign || astro.sunSign} (+3 ${sunElem})`); }
            if (moonElem) { scores[moonElem] += 2; contribuciones.astrologia.push(`Luna en ${astro.moon?.sign || astro.moonSign} (+2 ${moonElem})`); }
            if (risingElem) { scores[risingElem] += 2; contribuciones.astrologia.push(`Ascendente en ${astro.rising?.sign || astro.risingSign} (+2 ${risingElem})`); }

            const nahualColor = profile.mayan?.color; 
            if (nahualColor && this.MAYAN_COLORS_TO_ELEMENT[nahualColor]) {
                const elem = this.MAYAN_COLORS_TO_ELEMENT[nahualColor];
                scores[elem] += 3;
                contribuciones.maya.push(`Color del Nawal ${nahualColor} (+3 ${elem})`);
            }

            const chineseElement = profile.chinese?.element;
            if (chineseElement && this.CHINESE_TO_ELEMENT[chineseElement]) {
                const elem = this.CHINESE_TO_ELEMENT[chineseElement];
                scores[elem] += 2; // Increased weight for Chinese Element to make it fully operative
                contribuciones.chino.push(`Elemento Chino ${chineseElement} (+2 ${elem})`);
            }

            let finalElement: 'fuego' | 'tierra' | 'aire' | 'agua' = 'fuego';
            const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
            if (sorted[0][1] > 0) finalElement = sorted[0][0] as any;
            else if (sunElem) finalElement = sunElem;
            
            const frecuenciaMap = { fuego: 'Ígnea', tierra: 'Telúrica', aire: 'Etérea', agua: 'Abisal' };
            const lifePath = profile.numerology?.lifePathNumber || 1;
            let roleId = 1; 
            if ([1, 5].includes(lifePath)) { roleId = 1; contribuciones.numerologia.push(`Vibración de Vida ${lifePath} -> Iniciador`); }
            else if ([4, 8, 22].includes(lifePath)) { roleId = 2; contribuciones.numerologia.push(`Vibración de Vida ${lifePath} -> Constructor`); }
            else if ([2, 3, 6].includes(lifePath)) { roleId = 3; contribuciones.numerologia.push(`Vibración de Vida ${lifePath} -> Conector`); }
            else if ([7, 9, 11, 33].includes(lifePath)) { roleId = 4; contribuciones.numerologia.push(`Vibración de Vida ${lifePath} -> Analista`); }

            const roleNameMap = { 1: 'Iniciador', 2: 'Constructor', 3: 'Conector', 4: 'Analista' };
            const archetype = this.ARCHETYPE_MATRIX[finalElement][roleId] || { 
                nombre: "El Arquitecto", 
                desc: "Diseña y sostiene el plano de la realidad material con precisión absoluta." 
            };

            const result: ArchetypeResult = {
                nombre: archetype.nombre,
                frecuencia: frecuenciaMap[finalElement],
                rol: roleNameMap[roleId as 1|2|3|4] || 'Iniciador',
                descripcion: archetype.desc,
                elemento_dominante: finalElement,
                desglose: {
                    scores: { ...scores },
                    contribuciones
                }
            };

            // Astrocartografía Simplificada: Líneas de Poder
            if (astro.planets && (astro.ascendant !== undefined || astro.rising?.absDegree !== undefined)) {
                result.powerLines = this.calculatePowerLines(astro);
            }

            return result;
        } catch (err) {
            console.error("🔥 ArchetypeEngine Error:", err);
            return {
                nombre: "El Arquitecto Silencioso",
                frecuencia: "Etérea",
                rol: "Analista",
                descripcion: "Observa los patrones desde el silencio, esperando la alineación correcta.",
                elemento_dominante: "aire"
            };
        }
    }

    private static calculatePowerLines(astro: any): any[] {
        const planets = astro.planets || [];
        const asc = astro.rising?.absDegree || astro.ascendant || 0;
        const mc = astro.midheaven || 0;
        const dc = (asc + 180) % 360;
        const ic = (mc + 180) % 360;

        const angles = [
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
                        significado: `${p.name} en el ${angle.name} intensifica tu ${angle.desc.toLowerCase()}.`
                    });
                }
            });
        });

        return powerLines;
    }
}
