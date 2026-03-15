const { execSync } = require('child_process');
const fs = require('fs');
try {
    execSync('npx tsc -b', { encoding: 'utf-8', stdio: 'pipe' });
    console.log("No errors");
} catch (e) {
    fs.writeFileSync('tsc_errors_detailed.log', e.stdout);
    console.log("Errors written to tsc_errors_detailed.log");
}
