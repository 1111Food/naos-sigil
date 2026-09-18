const fs = require('fs');

let content = fs.readFileSync('server/src/modules/sigil/ConsciousnessEngine.ts', 'utf8');

const searchUpsert = `        // Save it to DB
        await supabase
            .from('sigil_daily_transmissions')
            .upsert({
                user_id: userId,
                date: date,
                moment: moment,
                transmission: transmissionText,
                was_sent: true,
                sent_at: new Date().toISOString(),
                archetype_used: archetypeUsed,
                delivery_channel: 'telegram',
                scheduler_runtime_version: 'v3',
                canonical_daily_context_version: 'v2_daily_context'
            }, { onConflict: 'user_id,date,moment' });`;

const replaceUpsert = `        // Save it to DB
        const payloadV3 = {
            user_id: userId,
            date: date,
            moment: moment,
            transmission: transmissionText,
            was_sent: true,
            sent_at: new Date().toISOString(),
            archetype_used: archetypeUsed,
            delivery_channel: 'telegram',
            scheduler_runtime_version: 'v3',
            canonical_daily_context_version: 'v2_daily_context'
        };

        const { error } = await supabase
            .from('sigil_daily_transmissions')
            .upsert(payloadV3, { onConflict: 'user_id,date,moment' });
            
        if (error?.code === '42703' || error?.message?.includes('column')) {
            // MIGRATION NOT YET APPLIED - Fallback to v1 payload to keep daily messages working
            console.warn("[CONSCIOUSNESS_ENGINE] Traceability columns not found. Falling back to v1 schema.");
            const payloadV1 = {
                user_id: userId,
                date: date,
                moment: moment,
                transmission: transmissionText,
                was_sent: true,
                sent_at: new Date().toISOString()
            };
            await supabase
                .from('sigil_daily_transmissions')
                .upsert(payloadV1, { onConflict: 'user_id,date,moment' });
        }`;

content = content.replace(searchUpsert, replaceUpsert);
fs.writeFileSync('server/src/modules/sigil/ConsciousnessEngine.ts', content);
console.log("Traceability backward-compatibility added");
