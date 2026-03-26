export interface ChineseAnimalData {
    id: string;
    chinese: string;
    name: string;
    archetype: string;
    essence: string;
    light: string;
    shadow: string;
    lifestyle: string;
    advice: string;
    curiousFact: string;
}

export interface ElementData {
    id: string;
    name: string;
    quality: string;
}

export const CHINESE_MANUAL = {
    intro: {
        title: "El Río del Tiempo",
        headerTitle1: "La Ecología",
        headerTitle2: "Interna",
        sources: "Fuentes: Ludovica Squirru / Horóscopo Chino",
        concept: "El Horóscopo Chino es tu Clima Interno y Estilo de Movimiento",
        content: "El tiempo no es una línea recta, es una espiral. El ciclo sexagenario combina 12 animales con 5 elementos para crear el ritmo de la evolución.",
        yinyang: "El Yang es acción y luz; el Yin es reflexión y receptividad. Todo tiene un ritmo y aprender a fluir con él es el secreto de la paz.",
        legend: "El Emperador de Jade convocó a una carrera para decidir los guardianes. Cada energía llegó a su manera: la Rata con astucia, el Buey con esfuerzo inquebrantable."
    },
    animalsSectionTitle: "Los 12 Guardianes",
    animalsSectionSubtitle: "Arquetipos del movimiento",
    labels: {
        essence: "La Esencia:",
        light: "En Luz (Dones):",
        shadow: "En Sombra (Retos):",
        advice: "Consejo Taoísta:",
        curiousFact: "Dato Curioso:"
    },
    elements: [
        { id: 'madera', name: 'Madera', quality: 'Crecimiento, expansión, ética y visión de futuro.' },
        { id: 'fuego', name: 'Fuego', quality: 'Pasión, dinamismo, claridad y vitalidad social.' },
        { id: 'tierra', name: 'Tierra', quality: 'Estabilidad, nutrición, sentido práctico y centro.' },
        { id: 'metal', name: 'Metal', quality: 'Estructura, ambición, resistencia y rectitud.' },
        { id: 'agua', name: 'Agua', quality: 'Fluidez, sabiduría profunda y comunicación fluida.' }
    ],
    animals: [
        {
            id: 'rata',
            chinese: 'Zi',
            name: 'Rata',
            archetype: 'El Conquistador Astuto',
            essence: 'La curiosidad incansable y la capacidad de encontrar recursos.',
            light: 'Diplomacia, encanto, ahorro inteligente y agudeza.',
            shadow: 'Manipulación, ansiedad por acumulación o crítica.',
            lifestyle: 'Estratega en el trabajo; protege su nido en el amor.',
            advice: 'La verdadera abundancia no es tener mucho, sino saber que nada te falta.',
            curiousFact: 'La Rata ganó la carrera del horóscopo saltando del lomo del Buey en el último segundo. Es la maestra del "timing" perfecto.'
        },
        {
            id: 'buey',
            chinese: 'Chou',
            name: 'Buey',
            archetype: 'El Constructor Silencioso',
            essence: 'La perseverancia que mueve montañas mediante el esfuerzo rítmico.',
            light: 'Lealtad, paciencia infinita, confiabilidad y método.',
            shadow: 'Terquedad absoluta, dificultad emocional o resentimiento.',
            lifestyle: 'Valora la tradición; construye relaciones para toda la vida.',
            advice: 'El bambú es fuerte porque sabe doblarse; no toda fuerza es rigidez.',
            curiousFact: 'El Buey es el único animal que puede trabajar sin descanso bajo la lluvia más intensa. Representa el poder de la paciencia absoluta.'
        },
        {
            id: 'tigre',
            chinese: 'Yin',
            name: 'Tigre',
            archetype: 'El Rebelde Apasionado',
            essence: 'El coraje de vivir bajo sus propias reglas e intensidad emocional.',
            light: 'Magnetismo, valentía ante la injusticia, generosidad.',
            shadow: 'Impulsividad destructiva, ego herido o necesidad de atención.',
            lifestyle: 'Vive en los extremos; ama con fuego y trabaja con ráfagas.',
            advice: 'Tu fuerza no necesita demostrarse a gritos; el poder real es sereno.',
            curiousFact: 'En la antigüedad, se creía que el Tigre protegía a los niños de la mala suerte y los incendios. Su sola presencia purifica el hogar.'
        },
        {
            id: 'conejo',
            chinese: 'Mao',
            name: 'Conejo',
            archetype: 'El Diplomático Sensible',
            essence: 'La búsqueda de la paz, la estética y el bienestar interno.',
            light: 'Refinamiento, intuición, prudencia y consuelo.',
            shadow: 'Escapismo, miedo al conflicto o manipulación pasiva.',
            lifestyle: 'Busca entornos bellos; tierno y necesitado de seguridad.',
            advice: 'La paz no es ausencia de ruido, es el centro tranquilo en la tormenta.',
            curiousFact: 'El Conejo es considerado el signo de la longevidad. Se dice que habita en la Luna machacando el elixir de la inmortalidad.'
        },
        {
            id: 'dragon',
            chinese: 'Chen',
            name: 'Dragón',
            archetype: 'El Soñador Imperial',
            essence: 'La voluntad de manifestar lo extraordinario y el legado divino.',
            light: 'Creatividad desbordante, vitalidad y corazón magnánimo.',
            shadow: 'Arrogancia, intolerancia o frustración con la realidad.',
            lifestyle: 'Necesita una causa grande; teatral, apasionado y exigente.',
            advice: 'Para volar con las nubes, primero debes aprender a caminar sobre la tierra.',
            curiousFact: 'A diferencia de los dragones occidentales, el dragón chino es una criatura de agua y aire que trae lluvia para las cosechas.'
        },
        {
            id: 'serpiente',
            chinese: 'Si',
            name: 'Serpiente',
            archetype: 'El Místico Profundo',
            essence: 'La introspección que transmuta la experiencia en sabiduría.',
            light: 'Elegancia, perspicacia, autocontrol e intuición.',
            shadow: 'Desconfianza, posesividad fría o misterio excesivo.',
            lifestyle: 'Selectivo; prefiere la calidad sobre la cantidad siempre.',
            advice: 'Tener muchas respuestas no es sabiduría; sabiduría es saber cuándo callar.',
            curiousFact: 'La Serpiente es llamada "el pequeño dragón". Es el guardián de la sabiduría oculta y de los tesoros subterráneos del alma.'
        },
        {
            id: 'caballo',
            chinese: 'Wu',
            name: 'Caballo',
            archetype: 'El Espíritu Libre',
            essence: 'La autonomía emocional y la necesidad de movimiento físico.',
            light: 'Entusiasmo, independencia, agilidad mental.',
            shadow: 'Egoísmo, inconstancia o miedo a comprometerse.',
            lifestyle: 'Siempre en marcha; necesita libertad antes de regresar al nido.',
            advice: 'La libertad real no es correr lejos, es no estar atado a tus deseos.',
            curiousFact: 'El Caballo representa el sol y el éxito rápido. En el Taoismo, se dice que es capaz de "perseguir al sol" hasta el fin del mundo.'
        },
        {
            id: 'cabra',
            chinese: 'Wei',
            name: 'Cabra',
            archetype: 'El Artista Compasivo',
            essence: 'La conexión con la sensibilidad artística y la armonía grupal.',
            light: 'Empatía, creatividad suave, amabilidad.',
            shadow: 'Dependencia emocional, queja o falta de autodisciplina.',
            lifestyle: 'Alma del hogar; necesita sentirse necesitado y rodeado de afecto.',
            advice: 'Tu suavidad es tu fuerza; el agua desgasta la roca más dura.',
            curiousFact: 'La Cabra es el signo más artístico. Un hogar bendecido por una Cabra nunca carecerá de armonía y refugio espiritual.'
        },
        {
            id: 'mono',
            chinese: 'Shen',
            name: 'Mono',
            archetype: 'El Innovador Imparable',
            essence: 'La alegría de descubrir el mecanismo de las cosas e ingenio.',
            light: 'Versatilidad, humor sanador, rapidez mental.',
            shadow: 'Engaño, superficialidad o uso de la inteligencia para herir.',
            lifestyle: 'Eterno aprendiz; divertido pero difícil de atrapar.',
            advice: 'Usa tu mente para servir al corazón, y no al revés.',
            curiousFact: 'El Mono inventó el vino en la mitología china accidentalmente al guardar frutas en un árbol. Es el alquimista del azar.'
        },
        {
            id: 'gallo',
            chinese: 'You',
            name: 'Gallo',
            archetype: 'El Administrador Radiante',
            essence: 'La precisión, la claridad de visión y el aviso del nuevo día.',
            light: 'Coraje, organización impecable, honestidad.',
            shadow: 'Vanidad, crítica mordaz o perfeccionismo neurótico.',
            lifestyle: 'Ama el orden y el reconocimiento; protector y dedicado.',
            advice: 'El sol nace sin hacer ruido; deja que tus acciones hablen por ti.',
            curiousFact: 'El Gallo es el único animal que puede ahuyentar a los fantasmas con su canto al alba. Es el guardián de la luz solar.'
        },
        {
            id: 'perro',
            chinese: 'Xu',
            name: 'Perro',
            archetype: 'El Defensor de la Justicia',
            essence: 'Proteger la verdad y asegurar que nadie sea olvidado.',
            light: 'Integridad, fidelidad, sentido del deber y generosidad.',
            shadow: 'Pesimismo, desconfianza paranoica o terquedad.',
            lifestyle: 'Lo da todo por sus seres queridos; incondicional.',
            advice: 'Confía en tu propia bondad antes de buscar errores en el mundo.',
            curiousFact: 'El Perro es el guardián de las puertas de los templos. Representa la lealtad que trasciende incluso la muerte física.'
        },
        {
            id: 'cerdo',
            chinese: 'Hai',
            name: 'Cerdo',
            archetype: 'El Sabio del Disfrute',
            essence: 'El valor del placer sensorial, la paz mental y la honestidad.',
            light: 'Nobleza, gran corazón, fuerza de voluntad y epicureísmo.',
            shadow: 'Indulgencia excesiva, ingenuidad o cargar problemas ajenos.',
            lifestyle: 'Compañero tierno y estable; valora los banquetes y las risas.',
            advice: 'La simplicidad es la máxima sofisticación; ser feliz es sabiduría.'
        }
    ],
    integration: {
        title: "Integración: El Zoológico Interno",
        content: "Aunque naciste bajo un guardián, los 12 animales habitan dentro de ti. El objetivo es orquestar este zoológico según el clima del Tao.",
        closing: "Que el fluir del Agua te traiga sabiduría, y la solidez de la Tierra te brinde paz. ¡Maltiox!"
    }
};
