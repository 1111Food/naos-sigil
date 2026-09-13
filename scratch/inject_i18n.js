const fs = require('fs');

const path = 'client/src/i18n/index.tsx';
let content = fs.readFileSync(path, 'utf8');

const esKeys = `
        // Lifeline / Evolution Axis
        evolution_axis: "El Eje Evolutivo",
        evolution_axis_desc: "NAOS compilará la arquitectura profunda de tus etapas de vida, cruzando la matemática pitagórica con tu diseño astral, tu nahual y energía china para crear un modelo predictivo de tu evolución. Esta generación es permanente y única.",
        evolution_axis_btn: "Iniciar Compilación de Línea de Vida",
        evolution_axis_syncing: "Sincronizando frecuencias macro...",
        evolution_axis_title: "Eje Evolutivo",
        evolution_axis_mode_symbolic: "🌌 Modo Simbólico",
        evolution_axis_mode_behavioral: "🧠 Modo Conductual",
        evolution_axis_deep_dive: "Profundizar",
        evolution_axis_deep_dive_hide: "Ocultar Profundización",
        evolution_axis_deep_dive_fusion: "Profundizar en la Fusión de las 4 Intelligence Sources",
        evolution_axis_current_age: "Edad Actual",
        evolution_axis_years: "años",
        evolution_axis_current_cycle: "Ciclo Actual (Escala 9 Años)",
        evolution_axis_archetypal_coherence: "Coherencia Arquetípica",
        evolution_axis_missing_esoteric: "Lectura mística profunda no disponible en este momento.",
        evolution_axis_missing_biohacking: "Análisis conductual profundo no disponible en este momento.",
        evolution_axis_missing_reading: "Lectura no disponible",
        evolution_axis_missing_calculations: "Cálculos no disponibles",
        evolution_axis_stage: "Etapa",
        evolution_axis_creativity: "Creatividad",
        evolution_axis_leadership: "Liderazgo",
        evolution_axis_learning: "Aprendizaje",
        evolution_axis_expansion: "Expansión",
        evolution_axis_relationships: "Relaciones",
`;

const enKeys = `
        // Lifeline / Evolution Axis
        evolution_axis: "Evolution Axis",
        evolution_axis_desc: "NAOS will compile the deep architecture of your life stages, crossing Pythagorean mathematics with your astral design, your nawal, and Chinese energy to create a predictive model of your evolution. This generation is permanent and unique.",
        evolution_axis_btn: "Start Lifeline Compilation",
        evolution_axis_syncing: "Synchronizing macro frequencies...",
        evolution_axis_title: "Evolution Axis",
        evolution_axis_mode_symbolic: "🌌 Symbolic Mode",
        evolution_axis_mode_behavioral: "🧠 Behavioral Mode",
        evolution_axis_deep_dive: "Deep Dive",
        evolution_axis_deep_dive_hide: "Hide Deep Dive",
        evolution_axis_deep_dive_fusion: "Deep Dive into the Fusion of the 4 Intelligence Sources",
        evolution_axis_current_age: "Current Age",
        evolution_axis_years: "years",
        evolution_axis_current_cycle: "Current Cycle (9-Year Scale)",
        evolution_axis_archetypal_coherence: "Archetypal Coherence",
        evolution_axis_missing_esoteric: "Deep mystical reading not available at this time.",
        evolution_axis_missing_biohacking: "Deep behavioral analysis not available at this time.",
        evolution_axis_missing_reading: "Reading not available",
        evolution_axis_missing_calculations: "Calculations not available",
        evolution_axis_stage: "Stage",
        evolution_axis_creativity: "Creativity",
        evolution_axis_leadership: "Leadership",
        evolution_axis_learning: "Learning",
        evolution_axis_expansion: "Expansion",
        evolution_axis_relationships: "Relationships",
`;

content = content.replace(/time_navigator: "Navegador del Tiempo"\s*\}/, "time_navigator: \"Navegador del Tiempo\"," + esKeys + "    }");
content = content.replace(/time_navigator: "Time Navigator"\s*\}/, "time_navigator: \"Time Navigator\"," + enKeys + "    }");

fs.writeFileSync(path, content);
console.log('Done injecting translations.');
