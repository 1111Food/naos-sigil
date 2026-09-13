const fs = require('fs'); let content = fs.readFileSync('server/src/routes/api.ts', 'utf8'); const oldStr = \    app.post<{ Body: { lang?: string } }>('/api/energy/current/generate', { 
        preHandler: [validateUser],
        config: {
            rateLimit: { max: 5, timeWindow: '1 minute' }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const langRaw = req.query.lang || 'es';\; const newStr = \    app.post<{ Body: { lang?: string } }>('/api/energy/current/generate', { 
        preHandler: [validateUser],
        config: {
            rateLimit: { max: 5, timeWindow: '1 minute' }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const langRaw = req.body.lang || 'es';\; content = content.replace(oldStr, newStr); fs.writeFileSync('server/src/routes/api.ts', content); console.log('Done');
