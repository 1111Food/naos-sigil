const fs = require('fs'); let content = fs.readFileSync('server/src/routes/api.ts', 'utf8'); const oldBlock = \    app.get<{ Querystring: { lang?: string } }>('/api/energy/current', {\; const newBlock = \    // YOY Current Energy Endpoint GET (Cache Only)
    app.get<{ Querystring: { lang?: string } }>('/api/energy/current', { 
        preHandler: [validateUser],
        config: { rateLimit: { max: 20, timeWindow: '1 minute' } }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const langRaw = req.query.lang || 'es';
        const lang = ['es', 'en'].includes(langRaw) ? langRaw : 'es'; 
        
        try {
            const { supabase } = require('../lib/supabase');
            const { data: fullProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (!fullProfile) throw new Error('User profile not found');
            
            const { DateUtils } = require('../utils/DateUtils');
            const currentTimezoneOffset = DateUtils.getCurrentTimezoneOffset(fullProfile);
            
            const { DailyContextOrchestrator } = require('../modules/daily/DailyContextOrchestrator');
            const v2Payload = await DailyContextOrchestrator.getDailySnapshot(userId, currentTimezoneOffset, lang);
            
            if (!v2Payload) return reply.status(404).send({ exists: false, needsGeneration: true });

            const { interpretation } = v2Payload;
            const energy = {
                daily: {
                    score: interpretation.score ?? null,
                    title: interpretation.primarySignal.title || (lang === 'es' ? 'Señal Diaria' : 'Daily Signal'),
                    description: interpretation.primarySignal.text || (interpretation.primarySignal as any).content,
                    action: interpretation.guidance || null,
                    avoid: (interpretation as any).avoid || null
                },
                metrics: { focus: null, creativity: null, relationships: null },
                interpretationStatus: interpretation.interpretationStatus
            };

            return { energy };
        } catch (error: any) {
            console.error('API Error (/api/energy/current GET):', error);
            return reply.status(500).send({ error: error.message });
        }
    });

    // YOY Current Energy Endpoint POST (Generate)
    app.post<{ Body: { lang?: string } }>('/api/energy/current/generate', { \; content = content.replace(oldBlock, newBlock); content = content.replace(\const v2Payload = await DailyContextOrchestrator.getOrGenerate(\, \const v2Payload = await DailyContextOrchestrator.getOrGenerate(\); fs.writeFileSync('server/src/routes/api.ts', content); console.log('Patched');
