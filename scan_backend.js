const fs = require('fs');
const path = require('path');

const startDir = 'c:\\Users\\l_her\\naos-platform\\server\\src';

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.match(/\.(ts|tsx)$/)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('name_naos') || content.includes('incrementBy') || content.includes('rituals_table')) {
                console.log(`[MATCH] ${fullPath}`);
            }
        }
    }
}

console.log("Scanning dir:", startDir);
scanDir(startDir);
console.log("Done SCAN.");
