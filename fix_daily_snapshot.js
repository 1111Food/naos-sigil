const fs = require('fs');
let dco = fs.readFileSync('server/src/modules/daily/DailyContextOrchestrator.ts', 'utf8');
dco = dco.replace("currentTimezoneOffset: number,", "fullProfile: any,");
fs.writeFileSync('server/src/modules/daily/DailyContextOrchestrator.ts', dco);

let api = fs.readFileSync('server/src/routes/api.ts', 'utf8');
api = api.replace("DailyContextOrchestrator.getDailySnapshot(userId, currentTimezoneOffset, lang)", "DailyContextOrchestrator.getDailySnapshot(userId, fullProfile, lang)");
fs.writeFileSync('server/src/routes/api.ts', api);
