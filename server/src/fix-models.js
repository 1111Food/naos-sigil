const fs = require('fs');
const path = require('path');

const DIR = 'c:/Users/l_her/naos-platform/server/src';

const replacements = [
    { from: /gemini-3\.5-flash-lite/g, to: 'gemini-1.5-flash' },
    { from: /gemini-3\.6-flash/g, to: 'gemini-1.5-pro' }
];

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            for (const r of replacements) {
                if (content.match(r.from)) {
                    content = content.replace(r.from, r.to);
                    changed = true;
                }
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed:', fullPath);
            }
        }
    }
}

processDirectory(DIR);
