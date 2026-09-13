
const fs = require('fs');
let api = fs.readFileSync('server/src/routes/api.ts', 'utf8');
api = api.replace(/\| ID:', userId/g, '| ID:\', userId.split(\'-\')[0]');
fs.writeFileSync('server/src/routes/api.ts', api);

let auth = fs.readFileSync('server/src/middleware/auth.ts', 'utf8');
auth = auth.replace(/User: \$\{user\.id\}/g, 'User: ');
auth = auth.replace(/Identified Admin Exception: \$\{user\.id\}/g, 'Identified Admin Exception: ');
fs.writeFileSync('server/src/middleware/auth.ts', auth);

