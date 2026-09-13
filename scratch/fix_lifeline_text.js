const fs = require('fs');

const path = 'client/src/pages/LifelineView.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    { from: /Sincronizando frecuencias macro\.\.\./g, to: "{t('evolution_axis_syncing', 'Sincronizando frecuencias macro...')}" },
    { from: /NAOS compilarÃ¡ la arquitectura profunda de tus etapas de vida, cruzando la matemÃ¡tica pitagÃ³rica con tu diseÃ±o astral, tu nahual y energÃ­a china para crear un modelo predictivo de tu evoluciÃ³n\. Esta generaciÃ³n es permanente y Ãºnica\./g, to: "{t('evolution_axis_desc', 'NAOS compilará la arquitectura profunda de tus etapas de vida, cruzando la matemática pitagórica con tu diseño astral, tu nahual y energía china para crear un modelo predictivo de tu evolución. Esta generación es permanente y única.')}" },
    { from: /Iniciar CompilaciÃ³n de LÃ­nea de Vida/g, to: "{t('evolution_axis_btn', 'Iniciar Compilación de Línea de Vida')}" },
    { from: /Eje Evolutivo/g, to: "{t('evolution_axis_title', 'Eje Evolutivo')}" },
    { from: /Edad Actual:/g, to: "{t('evolution_axis_current_age', 'Edad Actual:')}" },
    { from: /aÃ±os/g, to: "{t('evolution_axis_years', 'años')}" },
    { from: /ðŸŒŒ Modo SimbÃ³lico/g, to: "{t('evolution_axis_mode_symbolic', '🌌 Modo Simbólico')}" },
    { from: /ðŸ§ Modo Conductual/g, to: "{t('evolution_axis_mode_behavioral', '🧠 Modo Conductual')}" },
    { from: /Ciclo Actual \(Escala 9 AÃ±os\)/g, to: "{t('evolution_axis_current_cycle', 'Ciclo Actual (Escala 9 Años)')}" },
    { from: /Ocultar ProfundizaciÃ³n/g, to: "t('evolution_axis_deep_dive_hide', 'Ocultar Profundización')" },
    { from: /Profundizar en la FusiÃ³n de las 4 Intelligence Sources/g, to: "t('evolution_axis_deep_dive_fusion', 'Profundizar en la Fusión de las 4 Intelligence Sources')" },
    { from: /Profundizar</g, to: "t('evolution_axis_deep_dive', 'Profundizar')}<" },
    { from: /Lectura mística profunda no disponible en este momento\./g, to: "t('evolution_axis_missing_esoteric', 'Lectura mística profunda no disponible en este momento.')" },
    { from: /Análisis conductual profundo no disponible en este momento\./g, to: "t('evolution_axis_missing_biohacking', 'Análisis conductual profundo no disponible en este momento.')" },
    { from: /'Lectura no disponible'/g, to: "t('evolution_axis_missing_reading', 'Lectura no disponible')" },
    { from: /'Cálculos no disponibles'/g, to: "t('evolution_axis_missing_calculations', 'Cálculos no disponibles')" },
    { from: /Etapa/g, to: "${t('evolution_axis_stage', 'Etapa')}" },
    { from: /'Creatividad'/g, to: "t('evolution_axis_creativity', 'Creatividad')" },
    { from: /"Liderazgo"/g, to: "t('evolution_axis_leadership', 'Liderazgo')" },
    { from: /"Aprendizaje"/g, to: "t('evolution_axis_learning', 'Aprendizaje')" },
    { from: /"Expansión"/g, to: "t('evolution_axis_expansion', 'Expansión')" },
    { from: /'Relaciones'/g, to: "t('evolution_axis_relationships', 'Relaciones')" },
    { from: /"Coherencia ArquetÃ­pica"/g, to: "t('evolution_axis_archetypal_coherence', 'Coherencia Arquetípica')" }
];

replacements.forEach(r => {
    content = content.replace(r.from, r.to);
});

// Fix some specifics
content = content.replace(/\{t\('evolution_axis_title', 'Eje Evolutivo'\)\}/g, "t('evolution_axis_title', 'Eje Evolutivo')");
content = content.replace(/>\s*t\('evolution_axis_title', 'Eje Evolutivo'\)\s*</g, ">{t('evolution_axis_title', 'Eje Evolutivo')}<");

fs.writeFileSync(path, content);
console.log('Done fixing LifelineView translations.');
