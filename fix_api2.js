const fs = require('fs');
let content = fs.readFileSync('server/src/routes/api.ts', 'utf8');

const replacement = `            // Return readingData directly so frontend FrecuenciaDiaData matches, but add localDate
            
            // --- INJECT VIGÍA CÓSMICO IN-APP ---
            const { ConsciousnessEngine } = require('../modules/sigil/ConsciousnessEngine');
            const now = new Date();
            const userLocal = new Date(now.getTime() + (3600000 * currentTimezoneOffset));
            const userHours = userLocal.getUTCHours();
            
            let currentMoment = null;
            if (userHours >= 6 && userHours < 18) currentMoment = 'MORNING';
            else if (userHours >= 18) currentMoment = 'EVENING';

            if (currentMoment) {
                // Generates if missing, returns null if already generated. We fetch it next anyway.
                await ConsciousnessEngine.trySendTransmission(userId, v2Payload.localDate, currentMoment, lang).catch((e) => console.error("ConsciousnessEngine Error:", e));
            }
            
            // Fetch today's transmissions to surface in-app
            const { data: transmissions } = await supabase
                .from('sigil_daily_transmissions')
                .select('moment, transmission')
                .eq('user_id', userId)
                .eq('date', v2Payload.localDate);

            const finalData = {
                ...readingData,
                localDate: v2Payload.localDate,
                transmissions: transmissions || []
            };

            return { status: 'ok', data: finalData };`;

const rx = /\/\/ Return readingData directly so frontend FrecuenciaDiaData matches[\s\S]*return \{ status: 'ok', data: finalData \};/;

content = content.replace(rx, replacement);
fs.writeFileSync('server/src/routes/api.ts', content);
