const fs = require('fs');
let content = fs.readFileSync('client/src/pages/LifelineView.tsx', 'utf8');

// 1. Fix current cycle reading fallback
content = content.replace(
    /const cycleReading = \(viewMode === 'symbolic' \? lifeline\.current_cycle\?\.esoteric_reading : lifeline\.current_cycle\?\.biohacking_reading\) \|\| \{[\s\S]*?riesgo_principal: ".*"[\s\S]*?\};/g,
    const cycleReading = (viewMode === 'symbolic' ? lifeline.current_cycle?.esoteric_reading : lifeline.current_cycle?.biohacking_reading) || (viewMode === 'behavioral' ? lifeline.current_cycle?.esoteric_reading : lifeline.current_cycle?.biohacking_reading) || { objetivo_evolutivo: "Información Evolutiva Pendiente", riesgo_principal: "Lectura no disponible" };
);

// 2. Fix deep dive current cycle
content = content.replace(
    /\{viewMode === 'symbolic'\s*\?\s*\(lifeline\.current_cycle\?\.deep_dive_esoteric \|\| lifeline\.current_cycle\?\.description \|\| "Aprovecha la inercia de este ciclo para cimentar tus metas\."\)\s*:\s*\(lifeline\.current_cycle\?\.deep_dive_biohacking \|\| lifeline\.current_cycle\?\.description \|\| "Optimiza tu ritmo circadiano y enfoque diario para sostener el crecimiento\."\)\}/g,
    {viewMode === 'symbolic' ? (lifeline.current_cycle?.deep_dive_esoteric || "Lectura mística profunda no disponible en este momento.") : (lifeline.current_cycle?.deep_dive_biohacking || "Análisis conductual profundo no disponible en este momento.")}
);

// 3. Fix pinnacle reading
content = content.replace(
    /const reading = \(viewMode === 'symbolic' \? pin\.esoteric_reading : pin\.biohacking_reading\) \|\| \{[\s\S]*?talento_dormido: pin\.integration_key \|\| ".*"[\s\S]*?\};/g,
    const reading = (viewMode === 'symbolic' ? pin.esoteric_reading : pin.biohacking_reading) || (viewMode === 'behavioral' ? pin.esoteric_reading : pin.biohacking_reading) || { objetivo_evolutivo: pin.title || "Lectura no disponible", metricas_naos: "No disponible", riesgo_principal: "No disponible", virtud_desarrollar: "No disponible", talento_dormido: "No disponible" };
);

// 4. Remove hardcoded indicators
content = content.replace(
    /const indicators = pin\.indicators \|\| \{ creativity: 85, leadership: 80, learning: 90, expansion: 75, relationships: 85 \};/g,
    const indicators = pin.indicators;
);

// 5. Fix pinnacle deep dive
content = content.replace(
    /\{viewMode === 'symbolic'\s*\?\s*\(pin\.deep_dive_esoteric \|\| pin\.master_strategy \|\| "Sintonizaci.*"\)\s*:\s*\(pin\.deep_dive_biohacking \|\| pin\.core_challenge \|\| "Integraci.*"\)\}/g,
    {viewMode === 'symbolic' ? (pin.deep_dive_esoteric || "Lectura mística de la etapa no disponible.") : (pin.deep_dive_biohacking || "Integración conductual de la etapa no disponible.")}
);

// 6. Fix 4 Intelligence Sources
content = content.replace(
    /Profundizar en la Fusi.*n de las 4 Intelligence Sources/g,
    Profundizar en la Fusión de las 4 Intelligence Sources
);

fs.writeFileSync('client/src/pages/LifelineView.tsx', content, 'utf8');
