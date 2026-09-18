const fs = require('fs');
let c = fs.readFileSync('server/src/routes/admin.ts', 'utf8');

c = c.replace(/if \(error && \(error.code === '42703' \|\| error.message.includes\('column'\)\)\) {/, "if (dbError && (dbError.code === '42703' || dbError.message.includes('column'))) {");
fs.writeFileSync('server/src/routes/admin.ts', c);
console.log("Fixed dbError");
