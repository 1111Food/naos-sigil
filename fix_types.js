const fs = require('fs');
let c = fs.readFileSync('server/src/types/index.ts', 'utf8');
c = c.replace("UserProfile {\\n    canonical_archetype?: any;", "UserProfile {\n    canonical_archetype?: any;");
fs.writeFileSync('server/src/types/index.ts', c);
console.log("Fixed types");
