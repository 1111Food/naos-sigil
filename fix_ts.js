const fs = require('fs');
let content = fs.readFileSync('server/src/modules/daily/DailyContextOrchestrator.ts', 'utf8');
content = content.replace(/getUserLocalDate\(profile, now\)/g, "getUserLocalDate(fullProfile, now)");
fs.writeFileSync('server/src/modules/daily/DailyContextOrchestrator.ts', content);

let apiContent = fs.readFileSync('server/src/routes/api.ts', 'utf8');
apiContent = apiContent.replace(/\.catch\(\(e\) =>/g, ".catch((e: any) =>");
fs.writeFileSync('server/src/routes/api.ts', apiContent);
