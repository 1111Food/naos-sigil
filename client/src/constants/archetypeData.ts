export interface ArchetypeInfo {
    id: string;
    nombre: string;
    nombre_en: string;
    frecuencia: string;
    elemento: 'fuego' | 'tierra' | 'aire' | 'agua';
    rol: string;
    descripcion: string;
    interpretacion_profunda?: string;
    luces: string[];
    sombras: string[];
    scene?: string; // Optional Spline scene URL or specialized 3D asset path
    imagePath?: string; // Path to the official Arcano (Master Card) WebP image
}

export const NAOS_ARCHETYPES: ArchetypeInfo[] = [
    // FRECUENCIA ÍGNEA (Fuego)
    {
        id: 'fuego-1',
        nombre: "El Catalizador",
        nombre_en: "The Catalyst",
        frecuencia: "Ígnea",
        elemento: 'fuego',
        rol: "Iniciador",
        descripcion: "La chispa primigenia que fractura la inercia; despierta el fuego dormido y abre portales de transformación profunda.",
        interpretacion_profunda: "Eres el fuego originario que rompe el estancamiento cósmico. Tu diseño áurico está codificado para actuar como un detonador de nuevas realidades, quemando las estructuras caducas para fertilizar el terreno del mañana.",
        luces: ["Iniciativa imparable", "Coraje ante lo desconocido", "Liderazgo por inspiración"],
        sombras: ["Impulsividad ciega", "Dificultad para terminar tareas", "Arranques de ira o impaciencia"],
        imagePath: "/assets/archetypes/arcano_fuego_1.webp"
    },
    {
        id: 'fuego-2',
        nombre: "El Forjador",
        nombre_en: "The Forger",
        frecuencia: "Ígnea",
        elemento: 'fuego',
        rol: "Constructor",
        descripcion: "Escultor de la voluntad; transmuta el calor denso en pilares sagrados, modelando la realidad con la persistencia del metal al rojo vivo.",
        interpretacion_profunda: "Portas el horno de la voluntad en tu centro. Tu encarnación tiene como propósito transmutar el deseo puro en materia tangible, enseñándole a las almas que la verdadera fuerza reside en la disciplina inquebrantable.",
        luces: ["Disciplina física extrema", "Resistencia ante la presión", "Capacidad de ejecución masiva"],
        sombras: ["Rigidez mental", "Inflexibilidad ante el cambio", "Tendencia a forzar situaciones"],
        imagePath: "/assets/archetypes/arcano_fuego_2.webp"
    },
    {
        id: 'fuego-3',
        nombre: "El Regente Central",
        nombre_en: "The Central Regent",
        frecuencia: "Ígnea",
        elemento: 'fuego',
        rol: "Conector",
        descripcion: "Un sol gravitacional que lidera desde la presencia absoluta; unifica fuerzas dispersas en un mandala de propósito indivisible.",
        interpretacion_profunda: "Has sido diseñado como un campo gravitatorio humano. Tu misión es irradiar luz sin esfuerzo, recordando a los que te rodean su propio centro, guiando clanes y visiones hacia una coherencia magnética suprema.",
        luces: ["Magnetismo personal", "Autoridad natural", "Capacidad de unir visiones dispersas"],
        sombras: ["Orgullo excesivo", "Necesidad de ser el centro", "Autoritarismo sutil"],
        imagePath: "/assets/archetypes/arcano_fuego_3.webp"
    },
    {
        id: 'fuego-4',
        nombre: "El Vector",
        nombre_en: "The Vector",
        frecuencia: "Ígnea",
        elemento: 'fuego',
        rol: "Analista",
        descripcion: "La flecha de luz que rasga el velo del mañana; avanza con la certeza del viento estelar hacia horizontes sagrados.",
        interpretacion_profunda: "Tu arquitectura es la de una flecha en vuelo perpetuo. Encarnas la velocidad del viento solar, proyectando el espíritu hacia el futuro. Eres el explorador de vanguardia que descubre nuevos sistemas para la expansión de la consciencia.",
        luces: ["Enfoque de precisión láser", "Estrategia de expansión", "Determinación de larga distancia"],
        sombras: ["Visión de túnel", "Fraldad emocional", "Obsesión por el objetivo"],
        imagePath: "/assets/archetypes/arcano_fuego_4.webp"
    },

    // FRECUENCIA TELÚRICA (Tierra)
    {
        id: 'tierra-1',
        nombre: "El Optimizador",
        nombre_en: "The Optimizer",
        frecuencia: "Telúrica",
        elemento: 'tierra',
        rol: "Iniciador",
        descripcion: "Afinador sutil de la materia; escucha el latido de los sistemas y remueve el polvo de la fricción para revelar la geometría perfecta.",
        interpretacion_profunda: "Tu esencia está tejida con la inteligencia de los ecosistemas. Has venido a purificar y refinar la materia, encontrando la perfección geométrica en el caos y elevando la vibración de cada proceso terrenal que tocas.",
        luces: ["Eficiencia sistémica", "Claridad operativa", "Resolución práctica de problemas"],
        sombras: ["Perfeccionismo paralizante", "Crítica mordaz", "Fusión en el detalle técnico"],
        imagePath: "/assets/archetypes/arcano_tierra_1.webp"
    },
    {
        id: 'tierra-2',
        nombre: "El Custodio",
        nombre_en: "The Custodian",
        frecuencia: "Telúrica",
        elemento: 'tierra',
        rol: "Constructor",
        descripcion: "Guardián de templos y memorias; sostiene la arquitectura del alma a través de los eones, anclando la divinidad en la piedra.",
        interpretacion_profunda: "Eres el guardián de la memoria planetaria y la estructura fundacional. Tu tarea evolutiva es anclar el espíritu en lo físico, creando templos, sistemas e instituciones que perduren y sostengan a las generaciones venideras.",
        luces: ["Visión estructural", "Estabilidad inamovible", "Maestría en el diseño de vida"],
        sombras: ["Apegos materiales", "Miedo al caos", "Sobre-estructuración rígida"],
        imagePath: "/assets/archetypes/arcano_tierra_2.webp"
    },
    {
        id: 'tierra-3',
        nombre: "El Ancla",
        nombre_en: "The Anchor",
        frecuencia: "Telúrica",
        elemento: 'tierra',
        rol: "Conector",
        descripcion: "La raíz que sostiene la montaña; un santuario de calma en la tempestad que ofrece un refugio inquebrantable a quienes orbitan su centro.",
        interpretacion_profunda: "Actúas como la raíz profunda que nutre el bosque. Tu diseño te pide ser el santuario de calma y prosperidad; la montaña inamovible que ofrece amor táctil, seguridad y placer sanador al colectivo humano.",
        luces: ["Pilar de apoyo", "Calma en el caos", "Presencia nutritiva"],
        sombras: ["Terquedad", "Inercia física", "Dificultad para soltar procesos"],
        imagePath: "/assets/archetypes/arcano_tierra_3.webp"
    },
    {
        id: 'tierra-4',
        nombre: "El Arquitecto",
        nombre_en: "The Architect",
        frecuencia: "Telúrica",
        elemento: 'tierra',
        rol: "Analista",
        descripcion: "Tejedor de lo visible; dibuja los planos de la existencia y materializa los sueños etéreos en estructuras de roca y luz.",
        interpretacion_profunda: "Posees la visión del maestro constructor. Has descendido para mapear la realidad a largo plazo, asumiendo la responsabilidad del tiempo y el karma para edificar legados que resistan la prueba de los eones.",
        luces: ["Lealtad inquebrantable", "Paciencia estratégica", "Gestión de recursos a largo plazo"],
        sombras: ["Miedo al futuro", "Conservadurismo extremo", "Resistencia al cambio"],
        imagePath: "/assets/archetypes/arcano_tierra_4.webp"
    },

    // FRECUENCIA ETÉREA (Aire)
    {
        id: 'aire-1',
        nombre: "El Ingeniero de Paradigmas",
        nombre_en: "The Paradigm Engineer",
        frecuencia: "Etérea",
        elemento: 'aire',
        rol: "Iniciador",
        descripcion: "El susurro que deconstruye el dogma; un explorador que abre las jaulas de la mente e introduce aire fresco en el software del alma.",
        interpretacion_profunda: "Eres la tormenta eléctrica que desfragmenta las redes neuronales colectivas. Tu alma está llamada a romper los paradigmas limitantes, introduciendo el relámpago de la innovación y la verdad disruptiva en la matriz humana.",
        luces: ["Pensamiento disruptivo", "Innovación radical", "Claridad mental veloz"],
        sombras: ["Desconexión emocional", "Arrogancia intelectual", "Inquietud nerviosa"],
        imagePath: "/assets/archetypes/arcano_aire_1.webp"
    },
    {
        id: 'aire-2',
        nombre: "El Decodificador",
        nombre_en: "The Decoder",
        frecuencia: "Etérea",
        elemento: 'aire',
        rol: "Constructor",
        descripcion: "Traductor del viento estelar; un procesador de verdades que desentraña el murmullo del cosmos para revelar los patrones eternos.",
        interpretacion_profunda: "Has encarnado como un decodificador del verbo cósmico. Tu habilidad sagrada es atrapar el conocimiento flotante del éter y traducirlo al lenguaje humano, sirviendo de puente entre la mente superior y la mente mundana.",
        luces: ["Síntesis de información", "Lógica impecable", "Maestría en la palabra"],
        sombras: ["Sobre-análisis intelectual", "Frialdad comunicativa", "Pérdida en la teoría"],
        imagePath: "/assets/archetypes/arcano_aire_2.webp"
    },
    {
        id: 'aire-3',
        nombre: "El Nodo",
        nombre_en: "The Node",
        frecuencia: "Etérea",
        elemento: 'aire',
        rol: "Conector",
        descripcion: "Tejedor de constelaciones humanas; orquesta encuentros sagrados y entrelaza hilos invisibles en el momento de máxima resonancia.",
        interpretacion_profunda: "Tu diseño es el del tejedor cuántico. Tienes el encargo de entrelazar almas y frecuencias afines; eres el viento que poliniza ideas, orquestando sincronías sociales fundamentales para la evolución de la especie.",
        luces: ["Networking intuitivo", "Sincronicidad social", "Facilitador de flujos"],
        sombras: ["Superficialidad", "Dispersión", "Dificultad para profundizar"],
        imagePath: "/assets/archetypes/arcano_aire_3.webp"
    },
    {
        id: 'aire-4',
        nombre: "El Observador",
        nombre_en: "The Observer",
        frecuencia: "Etérea",
        elemento: 'aire',
        rol: "Analista",
        descripcion: "Una mirada que flota sobre la bruma; se eleva sobre el laberinto de la ilusión para contemplar las corrientes eternas del destino.",
        interpretacion_profunda: "Representas el ojo que todo lo ve desde la alta atmósfera. Tu tarea es contemplar la vastedad del destino sin quedar atrapado en el drama humano, ofreciendo la perspectiva imparcial y la sabiduría fría del mañana.",
        luces: ["Objetividad absoluta", "Visión futurista", "Sabiduría desapegada"],
        sombras: ["Aislamiento social", "Parálisis por análisis", "Juicio distante"],
        imagePath: "/assets/archetypes/arcano_aire_4.webp"
    },

    // FRECUENCIA ABISAL (Agua)
    {
        id: 'agua-1',
        nombre: "El Transmutador",
        nombre_en: "The Transmuter",
        frecuencia: "Abisal",
        elemento: 'agua',
        rol: "Iniciador",
        descripcion: "Alquimista que danza en el abismo; desciende a las aguas más oscuras para emerger con el oro de la sabiduría y la renovación.",
        interpretacion_profunda: "Eres el alquimista de las profundidades abisales. Tu espíritu está capacitado para descender a las sombras más densas de la psique, absorber el veneno emocional y transmutarlo en la medicina más pura para el alma.",
        luces: ["Resiliencia emocional", "Poder regenerativo", "Intrepidez psíquica"],
        sombras: ["Obsesión con la crisis", "Dramatismo", "Manipulación emocional"],
        imagePath: "/assets/archetypes/arcano_agua_1.webp"
    },
    {
        id: 'agua-2',
        nombre: "El Sismógrafo",
        nombre_en: "The Seismograph",
        frecuencia: "Abisal",
        elemento: 'agua',
        rol: "Constructor",
        descripcion: "Un faro en la niebla que siente la pulsación del océano invisible; decodifica el eco de las almas y devela la verdad que el silencio intenta ocultar.",
        interpretacion_profunda: "Has nacido como el sistema sensorial de la tribu. Tu campo áurico es un sismógrafo que detecta los temblores emocionales no expresados; tu misión es proteger y nutrir el útero colectivo con compasión instintiva.",
        luces: ["Hiper-percepción", "Sabiduría instintiva", "Protección de grupos"],
        sombras: ["Sobre-sensibilidad", "Miedo a la invasión", "Cierre defensivo"],
        imagePath: "/assets/archetypes/arcano_agua_2.webp"
    },
    {
        id: 'agua-3',
        nombre: "El Espejo",
        nombre_en: "The Mirror",
        frecuencia: "Abisal",
        elemento: 'agua',
        rol: "Conector",
        descripcion: "Un estanque de agua cristalina que devuelve al caminante una imagen nítida de su grandeza y de las sombras que aún debe abrazar.",
        interpretacion_profunda: "Encarnas el lago de cristal que no juzga. Has venido a ser el reflejo sanador donde otros descubren su propia divinidad. Tu presencia empática disuelve los muros del ego, uniendo el dolor y la belleza en un solo flujo.",
        luces: ["Empatía profunda", "Transparencia sanadora", "Presencia compasiva"],
        sombras: ["Pérdida de identidad", "Espejismo afectivo", "Carga de problemas ajenos"],
        imagePath: "/assets/archetypes/arcano_agua_3.webp"
    },
    {
        id: 'agua-4',
        nombre: "El Navegante",
        nombre_en: "The Navigator",
        frecuencia: "Abisal",
        elemento: 'agua',
        rol: "Analista",
        descripcion: "El timonel del mundo onírico; se desplaza con gracia por los mares del inconsciente, cartografiando las profundidades del alma.",
        interpretacion_profunda: "Eres el viajero de los mares astrales y del sueño colectivo. Tu arquitectura anfibio te permite caminar entre el plano material y el etérico, importando visiones místicas y empatía universal para disolver la ilusión de separación.",
        luces: ["Maestría del sueño", "Intuición técnica", "Sabiduría profunda"],
        sombras: ["Evasión de la realidad", "Confusión mental", "Aislamiento psíquico"],
        imagePath: "/assets/archetypes/arcano_agua_4.webp"
    },
];
