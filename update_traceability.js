import fs from 'fs';
let content = fs.readFileSync('server/src/modules/sigil/ConsciousnessEngine.ts', 'utf8');

const searchUpsert = `                transmission: transmissionText,
                was_sent: true,
                sent_at: new Date().toISOString()
            }, { onConflict: 'user_id,date,moment' });`;

const replaceUpsert = `                transmission: transmissionText,
                was_sent: true,
                sent_at: new Date().toISOString(),
                archetype_used: "Arquitecto", // TODO extract from generator
                delivery_channel: 'telegram',
                scheduler_runtime_version: 'v3',
                canonical_daily_context_version: 'v2_daily_context'
            }, { onConflict: 'user_id,date,moment' });`;

content = content.replace(searchUpsert, replaceUpsert);
fs.writeFileSync('server/src/modules/sigil/ConsciousnessEngine.ts', content);
console.log("Traceability fields added to ConsciousnessEngine");
