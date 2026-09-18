const fs = require('fs');
let content = fs.readFileSync('server/src/modules/daily/DailyContextOrchestrator.ts', 'utf8');

content = content.replace(/getUserLocalDate\(currentTimezoneOffset, now\)/g, "getUserLocalDate(profile, now)");
fs.writeFileSync('server/src/modules/daily/DailyContextOrchestrator.ts', content);
