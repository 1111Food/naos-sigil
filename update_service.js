const fs = require('fs');
let c = fs.readFileSync('server/src/modules/sigil/service.ts', 'utf8');
c = c.replace(
  "[]",
  "[]"
);
fs.writeFileSync('server/src/modules/sigil/service.ts', c);
