const fs = require('fs');
let content = fs.readFileSync('client/src/components/UpgradeModal.tsx', 'utf8');

content = content.replace(
    /"Para gestionar múltiples arquitecturas humanas simultáneamente, expande tu acceso al nivel de \{archName\}\."/,
    '`Para gestionar múltiples arquitecturas humanas simultáneamente, expande tu acceso al nivel de ${archName}.`'
);

content = content.replace(
    /"Para gestionar mltiples arquitecturas humanas simultneamente, expande tu acceso al nivel de \{archName\}\."/,
    '`Para gestionar múltiples arquitecturas humanas simultáneamente, expande tu acceso al nivel de ${archName}.`'
);

// We need a brute force string replace for the non-ASCII chars
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('tu acceso al nivel de {archName}')) {
        lines[i] = '        body: `Para gestionar múltiples arquitecturas humanas simultáneamente, expande tu acceso al nivel de ${archName}.`,';
    }
}
content = lines.join('\n');

fs.writeFileSync('client/src/components/UpgradeModal.tsx', content);
