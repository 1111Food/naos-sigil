export interface RevelationCopy {
    title: string;
    shortLine: string;
    optionalSecondaryLine?: string;
}

type DictionaryMap = Record<string, RevelationCopy>;

export const FIRST_REVELATION_COPY: Record<'en' | 'es', {
    ASTROLOGY: DictionaryMap;
    NUMEROLOGY: DictionaryMap;
    MAYA: DictionaryMap;
    CHINESE: DictionaryMap;
}> = {
    en: {
        ASTROLOGY: {
            'aries': { title: 'Aries', shortLine: 'You seek ignition, but resist patience.' },
            'taurus': { title: 'Taurus', shortLine: 'You seek foundation, but resist sudden change.' },
            'gemini': { title: 'Gemini', shortLine: 'You seek motion, but resist stillness.' },
            'cancer': { title: 'Cancer', shortLine: 'You seek belonging, but protect your exposure.' },
            'leo': { title: 'Leo', shortLine: 'You seek expression, but resist being unseen.' },
            'virgo': { title: 'Virgo', shortLine: 'You seek order, but resist the chaos of the unknown.' },
            'libra': { title: 'Libra', shortLine: 'You seek harmony, but resist necessary conflict.' },
            'scorpio': { title: 'Scorpio', shortLine: 'You seek transformation, but resist the superficial.' },
            'sagittarius': { title: 'Sagittarius', shortLine: 'You seek expansion, but resist confinement.' },
            'capricorn': { title: 'Capricorn', shortLine: 'You seek structure, but resist spontaneity.' },
            'aquarius': { title: 'Aquarius', shortLine: 'You seek liberation, but resist conformity.' },
            'pisces': { title: 'Pisces', shortLine: 'You seek transcendence, but resist rigid boundaries.' }
        },
        NUMEROLOGY: {
            '1': { title: 'Path 1', shortLine: 'The force of initiation.', optionalSecondaryLine: 'You pave roads where none exist.' },
            '2': { title: 'Path 2', shortLine: 'The art of connection.', optionalSecondaryLine: 'You weave the threads between others.' },
            '3': { title: 'Path 3', shortLine: 'The pulse of creation.', optionalSecondaryLine: 'Your energy must be expressed to be understood.' },
            '4': { title: 'Path 4', shortLine: 'The architect of reality.', optionalSecondaryLine: 'You build the structures that outlast time.' },
            '5': { title: 'Path 5', shortLine: 'The catalyst of change.', optionalSecondaryLine: 'Freedom is your absolute necessity.' },
            '6': { title: 'Path 6', shortLine: 'The guardian of harmony.', optionalSecondaryLine: 'You carry the responsibility of healing.' },
            '7': { title: 'Path 7', shortLine: 'The seeker of truth.', optionalSecondaryLine: 'You look beyond the visible spectrum.' },
            '8': { title: 'Path 8', shortLine: 'The master of material.', optionalSecondaryLine: 'You manifest energy into tangible power.' },
            '9': { title: 'Path 9', shortLine: 'The closer of cycles.', optionalSecondaryLine: 'You understand what must be released.' },
            '11': { title: 'Path 11', shortLine: 'The illuminated channel.', optionalSecondaryLine: 'You bridge the intuitive with the real.' },
            '22': { title: 'Path 22', shortLine: 'The master builder.', optionalSecondaryLine: 'You ground visionary ideas into vast reality.' },
            '33': { title: 'Path 33', shortLine: 'The master teacher.', optionalSecondaryLine: 'Your journey is one of profound empathy.' }
        },
        MAYA: {
            'BATZ': { title: 'B\'atz\'', shortLine: 'The thread of time.', optionalSecondaryLine: 'You weave the beginning of new cycles.' },
            'E': { title: 'E', shortLine: 'The path of destiny.', optionalSecondaryLine: 'You guide the collective forward.' },
            'AJ': { title: 'Aj', shortLine: 'The pillar of authority.', optionalSecondaryLine: 'You establish firm foundations.' },
            'IX': { title: 'I\'x', shortLine: 'The jaguar\'s altar.', optionalSecondaryLine: 'You hold the energy of the earth\'s vitality.' },
            'TZIKIN': { title: 'Tz\'ikin', shortLine: 'The visionary bird.', optionalSecondaryLine: 'You see the broader horizon.' },
            'AJMAQ': { title: 'Ajmaq', shortLine: 'The ancestral owl.', optionalSecondaryLine: 'You navigate the shadows with wisdom.' },
            'NOJ': { title: 'No\'j', shortLine: 'The cosmic intellect.', optionalSecondaryLine: 'You transform knowledge into understanding.' },
            'TIJAX': { title: 'Tijax', shortLine: 'The obsidian blade.', optionalSecondaryLine: 'You sever what no longer serves.' },
            'KAWOQ': { title: 'Kawoq', shortLine: 'The ancestral storm.', optionalSecondaryLine: 'You bring collective healing.' },
            'AJPU': { title: 'Ajpu', shortLine: 'The solar hunter.', optionalSecondaryLine: 'You walk the hero\'s journey of light.' },
            'IMOX': { title: 'Imox', shortLine: 'The primordial water.', optionalSecondaryLine: 'You navigate the depths of the collective mind.' },
            'IQ': { title: 'Iq\'', shortLine: 'The vital breath.', optionalSecondaryLine: 'You carry the winds of sudden change.' },
            'AQABAL': { title: 'Aq\'ab\'al', shortLine: 'The dawn\'s light.', optionalSecondaryLine: 'You bridge the night and the day.' },
            'KAT': { title: 'K\'at', shortLine: 'The energetic net.', optionalSecondaryLine: 'You gather and untangle complex webs.' },
            'KAN': { title: 'Kan', shortLine: 'The plumed serpent.', optionalSecondaryLine: 'You channel raw, ascending energy.' },
            'KAME': { title: 'Kame', shortLine: 'The cycle of transformation.', optionalSecondaryLine: 'You understand the necessity of endings.' },
            'KEJ': { title: 'Kej', shortLine: 'The sturdy deer.', optionalSecondaryLine: 'You balance strength with grace.' },
            'QANIL': { title: 'Q\'anil', shortLine: 'The fertile seed.', optionalSecondaryLine: 'You gestate new beginnings.' },
            'TOJ': { title: 'Toj', shortLine: 'The sacred fire.', optionalSecondaryLine: 'You balance the scales of action.' },
            'TZI': { title: 'Tz\'i\'', shortLine: 'The loyal guardian.', optionalSecondaryLine: 'You uphold cosmic justice.' }
        },
        CHINESE: {
            'rata': { title: 'Rat', shortLine: 'Quick mind, hidden depths.' },
            'buey': { title: 'Ox', shortLine: 'Unyielding strength, slow momentum.' },
            'tigre': { title: 'Tiger', shortLine: 'Magnetic presence, sudden leaps.' },
            'conejo': { title: 'Rabbit', shortLine: 'Quiet intuition, rapid evasion.' },
            'dragon': { title: 'Dragon', shortLine: 'Imperial vision, heavy expectations.' },
            'serpiente': { title: 'Snake', shortLine: 'Silent wisdom, shedding the past.' },
            'caballo': { title: 'Horse', shortLine: 'Untamed spirit, constant motion.' },
            'cabra': { title: 'Goat', shortLine: 'Artistic soul, internal complexity.' },
            'mono': { title: 'Monkey', shortLine: 'Playful genius, restless focus.' },
            'gallo': { title: 'Rooster', shortLine: 'Fierce clarity, sharp boundaries.' },
            'perro': { title: 'Dog', shortLine: 'Loyal protector, anxious vigilance.' },
            'cerdo': { title: 'Pig', shortLine: 'Generous heart, vulnerable trust.' }
        }
    },
    es: {
        ASTROLOGY: {
            'aries': { title: 'Aries', shortLine: 'Buscas la ignición, pero resistes la paciencia.' },
            'taurus': { title: 'Tauro', shortLine: 'Buscas la base, pero resistes el cambio repentino.' },
            'gemini': { title: 'Géminis', shortLine: 'Buscas el movimiento, pero resistes la quietud.' },
            'cancer': { title: 'Cáncer', shortLine: 'Buscas pertenencia, pero proteges tu vulnerabilidad.' },
            'leo': { title: 'Leo', shortLine: 'Buscas expresión, pero resistes ser invisible.' },
            'virgo': { title: 'Virgo', shortLine: 'Buscas el orden, pero resistes el caos de lo desconocido.' },
            'libra': { title: 'Libra', shortLine: 'Buscas la armonía, pero resistes el conflicto necesario.' },
            'scorpio': { title: 'Escorpio', shortLine: 'Buscas la transformación, pero resistes lo superficial.' },
            'sagittarius': { title: 'Sagitario', shortLine: 'Buscas la expansión, pero resistes el confinamiento.' },
            'capricorn': { title: 'Capricornio', shortLine: 'Buscas la estructura, pero resistes la espontaneidad.' },
            'aquarius': { title: 'Acuario', shortLine: 'Buscas la liberación, pero resistes la conformidad.' },
            'pisces': { title: 'Piscis', shortLine: 'Buscas la trascendencia, pero resistes los límites rígidos.' }
        },
        NUMEROLOGY: {
            '1': { title: 'Camino 1', shortLine: 'La fuerza de iniciación.', optionalSecondaryLine: 'Pavimentas caminos donde no existen.' },
            '2': { title: 'Camino 2', shortLine: 'El arte de la conexión.', optionalSecondaryLine: 'Tejes los hilos entre los demás.' },
            '3': { title: 'Camino 3', shortLine: 'El pulso de la creación.', optionalSecondaryLine: 'Tu energía debe expresarse para ser comprendida.' },
            '4': { title: 'Camino 4', shortLine: 'El arquitecto de la realidad.', optionalSecondaryLine: 'Construyes las estructuras que sobreviven al tiempo.' },
            '5': { title: 'Camino 5', shortLine: 'El catalizador del cambio.', optionalSecondaryLine: 'La libertad es tu necesidad absoluta.' },
            '6': { title: 'Camino 6', shortLine: 'El guardián de la armonía.', optionalSecondaryLine: 'Cargas con la responsabilidad de sanar.' },
            '7': { title: 'Camino 7', shortLine: 'El buscador de la verdad.', optionalSecondaryLine: 'Miras más allá del espectro visible.' },
            '8': { title: 'Camino 8', shortLine: 'El maestro de lo material.', optionalSecondaryLine: 'Manifiestas energía en poder tangible.' },
            '9': { title: 'Camino 9', shortLine: 'El cerrador de ciclos.', optionalSecondaryLine: 'Entiendes lo que debe ser liberado.' },
            '11': { title: 'Camino 11', shortLine: 'El canal iluminado.', optionalSecondaryLine: 'Eres el puente entre lo intuitivo y lo real.' },
            '22': { title: 'Camino 22', shortLine: 'El maestro constructor.', optionalSecondaryLine: 'Aterrizas ideas visionarias en la vasta realidad.' },
            '33': { title: 'Camino 33', shortLine: 'El maestro de maestros.', optionalSecondaryLine: 'Tu viaje es de profunda empatía.' }
        },
        MAYA: {
            'BATZ': { title: 'B\'atz\'', shortLine: 'El hilo del tiempo.', optionalSecondaryLine: 'Tejes el comienzo de nuevos ciclos.' },
            'E': { title: 'E', shortLine: 'El camino del destino.', optionalSecondaryLine: 'Guías al colectivo hacia adelante.' },
            'AJ': { title: 'Aj', shortLine: 'El pilar de autoridad.', optionalSecondaryLine: 'Estableces fundamentos firmes.' },
            'IX': { title: 'I\'x', shortLine: 'El altar del jaguar.', optionalSecondaryLine: 'Sostienes la energía vital de la tierra.' },
            'TZIKIN': { title: 'Tz\'ikin', shortLine: 'El pájaro visionario.', optionalSecondaryLine: 'Ves el horizonte más amplio.' },
            'AJMAQ': { title: 'Ajmaq', shortLine: 'El búho ancestral.', optionalSecondaryLine: 'Navegas las sombras con sabiduría.' },
            'NOJ': { title: 'No\'j', shortLine: 'El intelecto cósmico.', optionalSecondaryLine: 'Transformas el conocimiento en comprensión.' },
            'TIJAX': { title: 'Tijax', shortLine: 'La hoja de obsidiana.', optionalSecondaryLine: 'Cortas lo que ya no sirve.' },
            'KAWOQ': { title: 'Kawoq', shortLine: 'La tormenta ancestral.', optionalSecondaryLine: 'Traes sanación colectiva.' },
            'AJPU': { title: 'Ajpu', shortLine: 'El cazador solar.', optionalSecondaryLine: 'Caminas el viaje del héroe de la luz.' },
            'IMOX': { title: 'Imox', shortLine: 'El agua primordial.', optionalSecondaryLine: 'Navegas las profundidades de la mente colectiva.' },
            'IQ': { title: 'Iq\'', shortLine: 'El aliento vital.', optionalSecondaryLine: 'Llevas los vientos del cambio repentino.' },
            'AQABAL': { title: 'Aq\'ab\'al', shortLine: 'La luz del amanecer.', optionalSecondaryLine: 'Eres el puente entre la noche y el día.' },
            'KAT': { title: 'K\'at', shortLine: 'La red energética.', optionalSecondaryLine: 'Reúnes y desenredas redes complejas.' },
            'KAN': { title: 'Kan', shortLine: 'La serpiente emplumada.', optionalSecondaryLine: 'Canalizas energía cruda y ascendente.' },
            'KAME': { title: 'Kame', shortLine: 'El ciclo de transformación.', optionalSecondaryLine: 'Comprendes la necesidad de los finales.' },
            'KEJ': { title: 'Kej', shortLine: 'El ciervo robusto.', optionalSecondaryLine: 'Equilibras la fuerza con la gracia.' },
            'QANIL': { title: 'Q\'anil', shortLine: 'La semilla fértil.', optionalSecondaryLine: 'Gestas nuevos comienzos.' },
            'TOJ': { title: 'Toj', shortLine: 'El fuego sagrado.', optionalSecondaryLine: 'Equilibras la balanza de la acción.' },
            'TZI': { title: 'Tz\'i\'', shortLine: 'El guardián leal.', optionalSecondaryLine: 'Sostienes la justicia cósmica.' }
        },
        CHINESE: {
            'rata': { title: 'Rata', shortLine: 'Mente rápida, profundidades ocultas.' },
            'buey': { title: 'Buey', shortLine: 'Fuerza inquebrantable, impulso lento.' },
            'tigre': { title: 'Tigre', shortLine: 'Presencia magnética, saltos repentinos.' },
            'conejo': { title: 'Conejo', shortLine: 'Intuición silenciosa, evasión rápida.' },
            'dragon': { title: 'Dragón', shortLine: 'Visión imperial, expectativas pesadas.' },
            'serpiente': { title: 'Serpiente', shortLine: 'Sabiduría silenciosa, mudando el pasado.' },
            'caballo': { title: 'Caballo', shortLine: 'Espíritu indomable, movimiento constante.' },
            'cabra': { title: 'Cabra', shortLine: 'Alma artística, complejidad interna.' },
            'mono': { title: 'Mono', shortLine: 'Genio juguetón, enfoque inquieto.' },
            'gallo': { title: 'Gallo', shortLine: 'Claridad feroz, límites definidos.' },
            'perro': { title: 'Perro', shortLine: 'Protector leal, vigilancia ansiosa.' },
            'cerdo': { title: 'Cerdo', shortLine: 'Corazón generoso, confianza vulnerable.' }
        }
    }
};
