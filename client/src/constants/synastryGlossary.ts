export const getSynastryGlossary = (lang: string = 'es'): Record<string, { title: string; description: string }> => {
    const isEn = lang === 'en';
    return {
        // --- PILLAR DEFINITIONS ---
        PILLAR_SEXUAL_EROTIC: {
            title: isEn ? "Erotic Magnetism" : "Magnetismo Erotizado",
            description: isEn 
                ? "In NAOS, this pillar goes beyond physical attraction. It represents 'Creative Synergy': the capacity of both to ignite the spark of manifestation. It's the vital fuel that transforms a static idea into a vibrant reality through shared desire and drive."
                : "En NAOS, este pilar no se limita a la atracción física. Representa la 'Sinergia Creadora': la capacidad de ambos para encender la chispa de la manifestación. Es el combustible vital que transforma una idea estática en una realidad vibrante a través del deseo y la pulsión compartida."
        },
        PILLAR_INTELLECTUAL_MERCURIAL: {
            title: isEn ? "Mental Strategy" : "Estrategia Mental",
            description: isEn
                ? "Defines the architecture of communication and data processing in the bond. It's the capacity of both to decode each other's reality, create common languages, and design joint strategies that overcome individual biases."
                : "Define la arquitectura de comunicación y el procesamiento de datos del vínculo. Es la capacidad de ambos para decodificar la realidad del otro, crear lenguajes comunes y diseñar estrategias conjuntas que superen los sesgos individuales."
        },
        PILLAR_EMOTIONAL_LUNAR: {
            title: isEn ? "Emotional Gravity" : "Gravedad Emocional",
            description: isEn
                ? "The invisible force that holds the internal worlds of the couple together. It represents psychic nourishment, the security of belonging, and how your biological and emotional rhythms synchronize to create a refuge of coherence."
                : "La fuerza invisible que mantiene unidos los mundos internos de la pareja. Representa la nutrición psíquica, la seguridad de pertenencia y cómo sus ritmos biológicos y emocionales se sincronizan para crear un refugio de coherencia."
        },
        PILLAR_KARMIC_SATURNIAN: {
            title: isEn ? "Risk Architecture" : "Arquitectura de Riesgos",
            description: isEn
                ? "The pillar of structure and debt. Defines the lessons the bond has come to resolve. It's the resistance necessary for love to become commitment, and where individual shadows meet to be integrated through responsibility."
                : "El pilar de la estructura y la deuda. Define las lecciones que el vínculo ha venido a resolver. Es la resistencia necesaria para que el amor se convierta en compromiso, y donde las sombras individuales se encuentran para ser integradas a través de la responsabilidad."
        },
        PILLAR_SPIRITUAL_NEPTUNIAN: {
            title: isEn ? "Psychic Integration" : "Integración Psíquica",
            description: isEn
                ? "Represents the level of permeability between your identities. It's the capacity to transcend the 'I' to operate in a transpersonal 'we', where intuition, dreams, and spiritual purpose merge into a single vision."
                : "Representa el nivel de permeabilidad entre sus identidades. Es la capacidad de trascender el 'yo' para operar en un 'nosotros' transpersonal, donde la intuición, los sueños y el propósito espiritual se funden en una visión única."
        },
        PILLAR_ACTION_MARTIAL: {
            title: isEn ? "Power Dynamics" : "Dinámica de Poder",
            description: isEn
                ? "The executive pulse of the bond. Defines who takes the initiative, how conflict is managed, and how the couple 'attacks' reality to conquer their objectives. It is the directed will that protects and expands the shared territory."
                : "El pulso ejecutivo del vínculo. Define quién toma la iniciativa, cómo se gestiona el conflicto y de qué manera la pareja 'ataca' la realidad para conquistar sus objetivos. Es la voluntad dirigida que protege y expande el territorio compartido."
        },

        // --- INDICATORS ---
        RES_LUNAR: {
            title: isEn ? "Deep Lunar Resonance" : "Resonancia Lunar Profunda",
            description: isEn
                ? "Indicates a subconscious synchronization where emotional needs and internal rhythms of both flow effortlessly. It is the foundation of psychological safety in the bond."
                : "Indica una sincronización subconsciente donde las necesidades emocionales y los ritmos internos de ambos fluyen sin esfuerzo. Es la base de la seguridad psicológica en el vínculo."
        },
        FLUJO_MERCURIAL: {
            title: isEn ? "Mercurial Flow" : "Flujo Mercurial",
            description: isEn
                ? "Represents shared mental agility. Ideas are assimilated and transmitted at high speed, minimizing misunderstandings and enhancing joint problem solving."
                : "Representa una agilidad mental compartida. Las ideas se asimilan y transmiten a gran velocidad, minimizando los malentendidos y potenciando la resolución de problemas conjunta."
        },
        ATRACCION_TERMO: {
            title: isEn ? "Thermodynamic Attraction" : "Atracción Termodinámica",
            description: isEn
                ? "It is the vital and physical magnetism that keeps the energy of the bond in motion. It's not just desire, but a mutual propulsion towards action and manifestation."
                : "Es el magnetismo vital y físico que mantiene la energía del vínculo en movimiento. No es solo deseo, sino una propulsión mutua hacia la acción y la manifestación."
        },
        CHOQUE_CARMICO: {
            title: isEn ? "Saturnian Karmic Clash" : "Choque Cármico Saturnino",
            description: isEn
                ? "Represents areas of responsibility and difficult lessons. It is where the bond is tested under the pressure of reality, demanding maturity and structural commitment."
                : "Representa áreas de responsabilidad y lecciones difíciles. Es donde el vínculo se somete a prueba bajo la presión de la realidad, exigiendo madurez y compromiso estructural."
        },
        FRIC_MAYA: {
            title: isEn ? "Mayan Evolutionary Friction" : "Fricción Evolutiva Maya",
            description: isEn
                ? "Derived from the interaction between the Nahuales. Suggests that the life purpose of one challenges the growth of the other, forcing a constant evolution of consciousness."
                : "Derivada de la interacción entre los Nahuales. Sugiere que el propósito de vida de uno desafía el crecimiento del otro, obligando a una evolución constante de la conciencia."
        },
        DIS_EL_BASE: {
            title: isEn ? "Elemental Dissonance" : "Disonancia Elemental",
            description: isEn
                ? "Occurs when basic natures (Fire, Earth, Air, Water) operate at incompatible frequencies, requiring conscious effort to 'translate' each other's needs."
                : "Ocurre cuando las naturalezas básicas (Fuego, Tierra, Aire, Agua) operan en frecuencias incompatibles, requiriendo un esfuerzo consciente para 'traducir' las necesidades del otro."
        },
        CALIB_RITMOS: {
            title: isEn ? "Rhythm Calibration" : "Calibración de Ritmos",
            description: isEn
                ? "The process of adjusting the speed of execution and response between both. It is vital so that the ambition of one does not exhaust the resistance or patience of the other."
                : "El proceso de ajustar la velocidad de ejecución y respuesta entre ambos. Es vital para que la ambición de uno no agote la resistencia o paciencia del otro."
        },
        ESTABILIDAD_BASE: {
            title: isEn ? "Core Stability" : "Estabilidad Base",
            description: isEn
                ? "An earthly foundation of containment where security and order prevail over chaos, allowing for long-term construction."
                : "Un fundamento de contención terrestre donde la seguridad y el orden prevalecen sobre el caos, permitiendo una construcción a largo plazo."
        },
        SINC_SUAVE: {
            title: isEn ? "Soft Synchronization" : "Sincronización Suave",
            description: isEn
                ? "A period of low friction where the bond rests in productive neutrality, ideal for strategic planning without emotional dramas."
                : "Un periodo de baja fricción donde el vínculo descansa en una neutralidad productiva, ideal para la planificación estratégica sin dramas emocionales."
        }
    };
};
