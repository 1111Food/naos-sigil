const fs = require('fs');

const path = 'client/src/lib/numerologyEngine.ts';
let code = fs.readFileSync(path, 'utf8');

// replace this.masterReduce with NumerologyMathV1.reduceNumber
code = code.replace(/this\.masterReduce\(/g, 'NumerologyMathV1.reduceNumber(');

// replace this.reduce( with NumerologyMathV1.reduceNumber(..., { preserveMasters: false })
// But let's check if `this.reduce(` exists.
code = code.replace(/this\.reduce\(([^)]+)\)/g, 'NumerologyMathV1.reduceNumber($1, { preserveMasters: false })');

fs.writeFileSync(path, code);
console.log('Fixed client/src/lib/numerologyEngine.ts');
