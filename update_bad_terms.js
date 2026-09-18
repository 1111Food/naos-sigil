const fs = require('fs');

let prompts = fs.readFileSync('server/src/modules/sigil/prompts.ts', 'utf8');
prompts = prompts.replace(/Arquitecto de Realidad/g, 'Estratega');
fs.writeFileSync('server/src/modules/sigil/prompts.ts', prompts);

let service = fs.readFileSync('server/src/modules/sigil/service.ts', 'utf8');
service = service.replace(/Coach Espiritual/g, 'Inteligencia Personal');
service = service.replace(/Spiritual Coach/g, 'Personal Intelligence');
fs.writeFileSync('server/src/modules/sigil/service.ts', service);
