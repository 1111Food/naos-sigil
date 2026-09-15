const fs = require('fs');
let content = fs.readFileSync('client/src/i18n/index.tsx', 'utf8');

content = content.replace(/oracle_listens: "SIGIL.*/, 'oracle_listens: "SIGIL\\nTu interfaz de Inteligencia Personal.\\n\\nConecta qui\\u00E9n eres, lo que est\\u00E1 activo ahora y tu contexto\\npara ayudarte a ver patrones y decidir qu\\u00E9 hacer con ellos.",');

fs.writeFileSync('client/src/i18n/index.tsx', content, 'utf8');
