const fs = require('fs');
let c = fs.readFileSync('client/src/i18n/index.tsx', 'utf8');

// ES Replacements
c = c.replace(/oracle_listens: "El Oráculo Escucha"/, 'oracle_listens: "SIGIL\\nTu interfaz de Inteligencia Personal.\\n\\nConecta quién eres, lo que está activo ahora y tu contexto\\npara ayudarte a ver patrones y decidir qué hacer con ellos."');

c = c.replace(/El Sigil ha de sintonizar las coordenadas para tu avatar\.\\n\\nSincronizando frecuencias\.\.\./, 'Sigil está preparando el contexto de tu Código de Identidad.\\n\\nSincronizando datos...');

c = c.replace(/Asistente Cuántico/, 'Inteligencia Personal');
c = c.replace(/Consulta al Oráculo del Día. Sabiduría Astral./, 'Consulta tu contexto con Inteligencia Personal.');

// EN Replacements
c = c.replace(/oracle_listens: "The Oracle Listens"/, 'oracle_listens: "SIGIL\\nYour Personal Intelligence interface.\\n\\nIt connects who you are, what is active now, and your context\\nto help you see patterns and decide what to do with them."');

c = c.replace(/The Sigil must tune the coordinates for your avatar\.\\n\\nSynchronizing frequencies\.\.\./, 'Sigil is preparing the context of your Identity Code.\\n\\nSynchronizing data...');

c = c.replace(/Quantum Assistant/, 'Personal Intelligence');
c = c.replace(/Consult the Oracle of the Day. Astral Wisdom./, 'Consult your context with Personal Intelligence.');

fs.writeFileSync('client/src/i18n/index.tsx', c);
