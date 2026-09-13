const fs = require('fs');

// 1. Update ForecastService
let service = fs.readFileSync('server/src/modules/forecast/service.ts', 'utf8');

const oldServiceBuild =         const prompt = ForecastPromptBuilder.build(profile, behaviorContext, cycles, pinnacles, language);;
const newServiceBuild =         // 3.5. Fetch Macro Context
        const { data: macro } = await supabase
            .from('user_lifelines')
            .select('current_cycle')
            .eq('user_id', userId)
            .eq('language', language)
            .maybeSingle();

        // 4. Build Mega-Prompt
        const prompt = ForecastPromptBuilder.build(profile, behaviorContext, cycles, pinnacles, macro?.current_cycle, language);;

service = service.replace(oldServiceBuild, newServiceBuild);
fs.writeFileSync('server/src/modules/forecast/service.ts', service, 'utf8');

// 2. Update ForecastPromptBuilder
let prompt = fs.readFileSync('server/src/modules/forecast/promptBuilder.ts', 'utf8');

const oldBuildArgs =     static build(
        userData: any, 
        behaviorContext: string, 
        cycles12Months: any[], 
        pinnacles: any,
        language: string = 'es'
    ): string {;
const newBuildArgs =     static build(
        userData: any, 
        behaviorContext: string, 
        cycles12Months: any[], 
        pinnacles: any,
        macroContext: any,
        language: string = 'es'
    ): string {;

const oldPromptText = - La vibración de este Pináculo es: \.
- Este gran ciclo define el clima y el aprendizaje macro de esta década de su vida.;
const newPromptText = - La vibración de este Pináculo es: \.
- Este gran ciclo define el clima y el aprendizaje macro de esta década de su vida.
- (CONTEXTO MACRO AI PREVIO): \;

// Note: text in the TS file uses special char replacements due to encoding but I will just use regex to replace the block.
prompt = prompt.replace(/    static build\([\s\S]*?language: string = 'es'\n    \): string \{/, newBuildArgs);

prompt = prompt.replace(/- Este gran ciclo define el clima y el aprendizaje macro de esta d.*cada de su vida\./g, - Este gran ciclo define el clima y el aprendizaje macro de esta década de su vida.\n- (CONTEXTO MACRO AI PREVIO): \);

fs.writeFileSync('server/src/modules/forecast/promptBuilder.ts', prompt, 'utf8');
