const fs = require('fs');
let content = fs.readFileSync('client/src/pages/RankingView.tsx', 'utf8');

const s1 = `const TIERS = ['Fragmentado', 'Inestable', 'En Construcción', 'En Dominio', 'Arquitecto'];`;
const r1 = `const TIERS = ['Fragmentado', 'Inestable', 'En Construcción', 'En Dominio', profile?.canonical_archetype?.nombre || 'Arquitecto'];`;

content = content.replace(s1, r1);

const s2 = `alcanzar el rango de Arquitecto.`;
const r2 = `alcanzar el rango de {profile?.canonical_archetype?.nombre || 'Arquitecto'}.`;

content = content.replace(s2, r2);

fs.writeFileSync('client/src/pages/RankingView.tsx', content);
