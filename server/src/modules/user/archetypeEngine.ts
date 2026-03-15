
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
            1: { nombre: "El Catalizador", desc: "Propulsor de la chispa original; rompe la inercia sistémica para iniciar ciclos de evolución rápida y transformación absoluta." },
            2: { nombre: "El Forjador", desc: "Arquitecto de la voluntad; transmuta la energía cruda en estructuras de poder mediante la aplicación de fuerza táctica y persistencia." },
            3: { nombre: "El Regente Central", desc: "Centro de gravedad soberano; lidera desde la presencia absoluta, unificador de recursos y nodos en torno a un propósito superior." },
            4: { nombre: "El Vector", desc: "Navegante de la expansión; identifica y caza objetivos estratégicos a largo plazo mediante una visión cinemática del futuro." }
        },
        'tierra': {
            1: { nombre: "El Optimizador", desc: "Algoritmo de eficiencia pura; purifica sistemas complejos detectando fricciones invisibles para alcanzar la perfección operativa." },
            2: { nombre: "El Custodio", desc: "Guardián del tiempo y explorador de la consciencia; sostiene imperios a través de los eones mientras protege la frecuencia original." },
            3: { nombre: "El Ancla", desc: "Estabilidad gravitacional; actúa como el punto fijo en la tormenta, brindando seguridad inquebrantable a toda su red de influencia." },
            4: { nombre: "El Arquitecto", desc: "Maestro de la manifestación; diseña y sostiene los planos de la realidad material, unificando lo etérico con lo tangible." }
        },
        'aire': {
            1: { nombre: "El Ingeniero de Paradigmas", desc: "Hacker de paradigmas; deconstruye creencias obsoletas para programar nuevas realidades en el software de la mente colectiva." },
            2: { nombre: "El Decodificador", desc: "Traductor de la verdad oculta; procesa volúmenes masivos de datos para revelar la arquitectura subyacente del universo." },
            3: { nombre: "El Nodo", desc: "Maestro de la sinastría cuántica; orquesta conexiones vitales entre personas y recursos en el momento exacto de máxima coherencia." },
            4: { nombre: "El Observador", desc: "Perspectiva de alta frecuencia; se eleva sobre el ruido emocional para identificar las corrientes tectónicas del mañana." }
        },
        'agua': {
            1: { nombre: "El Transmutador", desc: "Alquimista del abismo; capaz de descender a las profundidades de la crisis para extraer el oro del aprendizaje y la evolución." },
            2: { nombre: "El Sismógrafo", desc: "Sensor de corrientes invisibles; detecta y estructura agendas ocultas y mareas emocionales con una precisión táctica infalible." },
            3: { nombre: "El Espejo", desc: "Reflector de potencial; devuelve al entorno una imagen nítida de su propia grandeza y de las fricciones que impiden su expansión." },
            4: { nombre: "El Navegante", desc: "Maestro del inconsciente; se desplaza con pericia técnica por los océanos de lo intangible, cartografiando el alma humana." }
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
