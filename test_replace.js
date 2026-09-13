const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CurrentEnergyView.tsx', 'utf8');
if (content.includes('Vercel no pudo contactar con NAOS AI')) {
    console.log('FAILED Vercel replacement');
} else {
    console.log('SUCCESS Vercel replacement');
}
if (content.includes('viewMode === \'symbolic\'')) {
    console.log('SUCCESS viewMode replacement');
} else {
    console.log('FAILED viewMode replacement');
}
