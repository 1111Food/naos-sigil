const fs = require('fs');
let content = fs.readFileSync('client/src/components/TimeMap/TimeMap.tsx', 'utf8');

const s1 = `Obtén visibilidad completa de tus próximos 11 meses con el Nivel Arquitecto.`;
const r1 = `Obtén visibilidad completa de tus próximos 11 meses con el Nivel {profile?.canonical_archetype?.nombre || 'Arquitecto'}.`;
content = content.replace(s1, r1);

const s2 = `Subir a Arquitecto`;
const r2 = `Subir a {profile?.canonical_archetype?.nombre || 'Arquitecto'}`;
content = content.replace(s2, r2);

fs.writeFileSync('client/src/components/TimeMap/TimeMap.tsx', content);
