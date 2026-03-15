export interface ArchetypeInfo {
    id: string;
    nombre: string;
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
        frecuencia: "Ígnea",
        elemento: 'fuego',
        rol: "Iniciador",
        descripcion: "Rompe la inercia, inicia el movimiento y enciende la chispa en sistemas inactivos.",
        luces: ["Iniciativa imparable", "Coraje ante lo desconocido", "Liderazgo por inspiración"],
        sombras: ["Impulsividad ciega", "Dificultad para terminar tareas", "Arranques de ira o impaciencia"],
        imagePath: "/assets/archetypes/arcano_fuego_1.webp"
    },
    {
        id: 'fuego-2',
        nombre: "El Forjador",
        frecuencia: "Ígnea",
        elemento: 'fuego',
        rol: "Constructor",
        descripcion: "Toma la energía cruda y la materializa. Voluntad aplicada con fuerza brutal para forjar la realidad.",
        luces: ["Disciplina física extrema", "Resistencia ante la presión", "Capacidad de ejecución masiva"],
        sombras: ["Rigidez mental", "Inflexibilidad ante el cambio", "Tendencia a forzar situaciones"],
        imagePath: "/assets/archetypes/arcano_fuego_2.webp"
    },
    {
        id: 'fuego-3',
        nombre: "El Regente Central",
        frecuencia: "Ígnea",
        elemento: 'fuego',
        rol: "Conector",
        descripcion: "Un centro de gravedad natural. Atrae recursos, personas y lidera desde la presencia absoluta.",
        luces: ["Magnetismo personal", "Autoridad natural", "Capacidad de unir visiones dispersas"],
        sombras: ["Orgullo excesivo", "Necesidad de ser el centro", "Autoritarismo sutil"],
        imagePath: "/assets/archetypes/arcano_fuego_3.webp"
    },
    {
        id: 'fuego-4',
        nombre: "El Vector",
        frecuencia: "Ígnea",
        elemento: 'fuego',
        rol: "Analista",
        descripcion: "La flecha que marca el rumbo. Visión de expansión rápida y caza táctica de objetivos a largo plazo.",
        luces: ["Enfoque de precisión láser", "Estrategia de expansión", "Determinación de larga distancia"],
        sombras: ["Visión de túnel", "Fraldad emocional", "Obsesión por el objetivo"],
        imagePath: "/assets/archetypes/arcano_fuego_4.webp"
    },

    // FRECUENCIA TELÚRICA (Tierra)
    {
        id: 'tierra-1',
        nombre: "El Optimizador",
        frecuencia: "Telúrica",
        elemento: 'tierra',
        rol: "Iniciador",
        descripcion: "El algoritmo vivo. Detecta fricciones y purifica cualquier sistema para alcanzar la máxima eficiencia.",
        luces: ["Eficiencia sistémica", "Claridad operativa", "Resolución práctica de problemas"],
        sombras: ["Perfeccionismo paralizante", "Crítica mordaz", "Fusión en el detalle técnico"],
        imagePath: "/assets/archetypes/arcano_tierra_1.webp"
    },
    {
        id: 'tierra-2',
        nombre: "El Custodio",
        frecuencia: "Telúrica",
        elemento: 'tierra',
        rol: "Constructor",
        descripcion: "Transmuta ideas etéricas en sistemas inquebrantables. Diseña y sostiene el plano de la realidad material.",
        luces: ["Visión estructural", "Estabilidad inamovible", "Maestría en el diseño de vida"],
        sombras: ["Apegos materiales", "Miedo al caos", "Sobre-estructuración rígida"],
        imagePath: "/assets/archetypes/arcano_tierra_2.webp"
    },
    {
        id: 'tierra-3',
        nombre: "El Ancla",
        frecuencia: "Telúrica",
        elemento: 'tierra',
        rol: "Conector",
        descripcion: "Fuerza gravitacional pura. Brinda estabilidad absoluta a su red; nada lo mueve de su centro.",
        luces: ["Pilar de apoyo", "Calma en el caos", "Presencia nutritiva"],
        sombras: ["Terquedad", "Inercia física", "Dificultad para soltar procesos"],
        imagePath: "/assets/archetypes/arcano_tierra_3.webp"
    },
    {
        id: 'tierra-4',
        nombre: "El Arquitecto",
        frecuencia: "Telúrica",
        elemento: 'tierra',
        rol: "Analista",
        descripcion: "El guardián del tiempo y los recursos. Resistencia infinita para sostener imperios a través del tiempo.",
        luces: ["Lealtad inquebrantable", "Paciencia estratégica", "Gestión de recursos a largo plazo"],
        sombras: ["Miedo al futuro", "Conservadurismo extremo", "Resistencia al cambio"],
        imagePath: "/assets/archetypes/arcano_tierra_4.webp"
    },

    // FRECUENCIA ETÉREA (Aire)
    {
        id: 'aire-1',
        nombre: "El Ingeniero de Paradigmas",
        frecuencia: "Etérea",
        elemento: 'aire',
        rol: "Iniciador",
        descripcion: "El hacker del sistema. Destruye creencias obsoletas e introduce nuevo software en la mente colectiva.",
        luces: ["Pensamiento disruptivo", "Innovación radical", "Claridad mental veloz"],
        sombras: ["Desconexión emocional", "Arrogancia intelectual", "Inquietud nerviosa"],
        imagePath: "/assets/archetypes/arcano_aire_1.webp"
    },
    {
        id: 'aire-2',
        nombre: "El Decodificador",
        frecuencia: "Etérea",
        elemento: 'aire',
        rol: "Constructor",
        descripcion: "Analiza volúmenes masivos de datos para estructurar la verdad oculta. El traductor del universo.",
        luces: ["Síntesis de información", "Lógica impecable", "Maestría en la palabra"],
        sombras: ["Sobre-análisis intelectual", "Frialdad comunicativa", "Pérdida en la teoría"],
        imagePath: "/assets/archetypes/arcano_aire_2.webp"
    },
    {
        id: 'aire-3',
        nombre: "El Nodo",
        frecuencia: "Etérea",
        elemento: 'aire',
        rol: "Conector",
        descripcion: "El maestro de la sinastría. Conecta a las personas, recursos y redes correctas en el momento cuántico exacto.",
        luces: ["Networking intuitivo", "Sincronicidad social", "Facilitador de flujos"],
        sombras: ["Superficialidad", "Dispersión", "Dificultad para profundizar"],
        imagePath: "/assets/archetypes/arcano_aire_3.webp"
    },
    {
        id: 'aire-4',
        nombre: "El Observador",
        frecuencia: "Etérea",
        elemento: 'aire',
        rol: "Analista",
        descripcion: "Perspectiva de dron. Se eleva sobre el ruido emocional para identificar los patrones del futuro.",
        luces: ["Objetividad absoluta", "Visión futurista", "Sabiduría desapegada"],
        sombras: ["Aislamiento social", "Parálisis por análisis", "Juicio distante"],
        imagePath: "/assets/archetypes/arcano_aire_4.webp"
    },

    // FRECUENCIA ABISAL (Agua)
    {
        id: 'agua-1',
        nombre: "El Transmutador",
        frecuencia: "Abisal",
        elemento: 'agua',
        rol: "Iniciador",
        descripcion: "El alquimista de la crisis. Capaz de entrar a los peores abismos psicológicos y salir con oro puro.",
        luces: ["Resiliencia emocional", "Poder regenerativo", "Intrepidez psíquica"],
        sombras: ["Obsesión con la crisis", "Dramatismo", "Manipulación emocional"],
        imagePath: "/assets/archetypes/arcano_agua_1.webp"
    },
    {
        id: 'agua-2',
        nombre: "El Sismógrafo",
        frecuencia: "Abisal",
        elemento: 'agua',
        rol: "Constructor",
        descripcion: "Sensibilidad táctica. Detecta y estructura las corrientes emocionales y agendas ocultas del entorno.",
        luces: ["Hiper-percepción", "Sabiduría instintiva", "Protección de grupos"],
        sombras: ["Sobre-sensibilidad", "Miedo a la invasión", "Cierre defensivo"],
        imagePath: "/assets/archetypes/arcano_agua_2.webp"
    },
    {
        id: 'agua-3',
        nombre: "El Espejo",
        frecuencia: "Abisal",
        elemento: 'agua',
        rol: "Conector",
        descripcion: "Empatía reflejante. Muestra a su red su verdadero potencial y sus fricciones con claridad absoluta.",
        luces: ["Empatía profunda", "Transparencia sanadora", "Presencia compasiva"],
        sombras: ["Pérdida de identidad", "Espejismo afectivo", "Carga de problemas ajenos"],
        imagePath: "/assets/archetypes/arcano_agua_3.webp"
    },
    {
        id: 'agua-4',
        nombre: "El Navegante",
        frecuencia: "Abisal",
        elemento: 'agua',
        rol: "Analista",
        descripcion: "Se mueve con maestría técnica en el mundo del inconsciente y lo intangible. El místico natural.",
        luces: ["Maestría del sueño", "Intuición técnica", "Sabiduría profunda"],
        sombras: ["Evasión de la realidad", "Confusión mental", "Aislamiento psíquico"],
        imagePath: "/assets/archetypes/arcano_agua_4.webp"
    },
];
