const fs = require('fs');

const path = 'client/src/lib/numerologyEngine.ts';
let code = fs.readFileSync(path, 'utf8');

// The method goes from `private static masterReduce(n: number): number {` to `}`
// We'll regex it out.
code = code.replace(/private static masterReduce\(n: number\): number \{[\s\S]*?return NumerologyMathV1\.reduceNumber\(sum\);\s*}/g, '');

fs.writeFileSync(path, code);
console.log('Cleaned client/src/lib/numerologyEngine.ts');
