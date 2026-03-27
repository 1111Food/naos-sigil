export interface ArchetypeInfo {
    id: string;
    nombre: string;
    nombre_en: string;
    frecuencia: string;
    elemento: 'fuego' | 'tierra' | 'aire' | 'agua';
    rol: string;
    descripcion: string;
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
        luces: ["Maestría del sueño", "Intuición técnica", "Sabiduría profunda"],
        sombras: ["Evasión de la realidad", "Confusión mental", "Aislamiento psíquico"],
        imagePath: "/assets/archetypes/arcano_agua_4.webp"
    },
];
