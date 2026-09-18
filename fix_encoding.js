const fs = require('fs');
let i18n = fs.readFileSync('client/src/i18n/index.tsx', 'utf8');
i18n = i18n.replace(/Conecta quin eres, lo que est activo ahora y tu contexto\\npara ayudarte a ver patrones y decidir qu hacer con ellos./, 'Conecta quién eres, lo que está activo ahora y tu contexto\\npara ayudarte a ver patrones y decidir qué hacer con ellos.');
fs.writeFileSync('client/src/i18n/index.tsx', i18n, 'utf8');
