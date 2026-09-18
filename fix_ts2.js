const fs = require('fs');
let dco = fs.readFileSync('server/src/modules/daily/DailyContextOrchestrator.ts', 'utf8');

// Replace in getOrGenerate
dco = dco.replace("const localDate = DateUtils.getUserLocalDate(currentTimezoneOffset, now);", "const localDate = DateUtils.getUserLocalDate(fullProfile, now);");

// Replace getDailySnapshot definition
const getDailySearch = `    static async getDailySnapshot(
        userId: string, 
        currentTimezoneOffset: number, 
        language: string, 
        now: Date = new Date()
    ): Promise<V2Payload | null> {
        const { DateUtils } = require('../../utils/DateUtils');
        const localDate = DateUtils.getUserLocalDate(currentTimezoneOffset, now);`;
        
const getDailyReplace = `    static async getDailySnapshot(
        userId: string, 
        fullProfile: any, 
        language: string, 
        now: Date = new Date()
    ): Promise<V2Payload | null> {
        const { DateUtils } = require('../../utils/DateUtils');
        const localDate = DateUtils.getUserLocalDate(fullProfile, now);`;
        
dco = dco.replace(getDailySearch, getDailyReplace);
fs.writeFileSync('server/src/modules/daily/DailyContextOrchestrator.ts', dco);

// Now in api.ts we already replaced the call properly, let's just make sure.
let api = fs.readFileSync('server/src/routes/api.ts', 'utf8');
api = api.replace("DailyContextOrchestrator.getDailySnapshot(userId, currentTimezoneOffset, lang)", "DailyContextOrchestrator.getDailySnapshot(userId, fullProfile, lang)");
// Also fix any dangling .catch(e) to .catch((e: any))
api = api.replace(/\.catch\(\(e\) =>/g, ".catch((e: any) =>");
fs.writeFileSync('server/src/routes/api.ts', api);
