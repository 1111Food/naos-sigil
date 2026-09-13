import fastify from 'fastify';
const auth = require('./src/middleware/auth');
auth.validateUser = async (req: any, reply: any) => {
    req.user_id = '924e8ee3-83b5-4774-a531-551dec2b097c';
    req.user = { id: '924e8ee3-83b5-4774-a531-551dec2b097c', role: 'premium' };
};
auth.validatePremium = async (req: any, reply: any) => { };

import { apiRoutes } from './src/routes/api';
import { coherenceRoutes } from './src/routes/coherence';

async function run() {
    const app = fastify();
    await app.register(apiRoutes);
    await app.register(coherenceRoutes, { prefix: '/api/coherence' });
    
    await app.listen({ port: 3004 });
    console.log('Listening on 3004');
    
    const res = await fetch('http://127.0.0.1:3004/api/coherence');
    console.log('Coherence status:', res.status);
    console.log(await res.text());
    
    const res2 = await fetch('http://127.0.0.1:3004/api/energy/current?lang=es');
    console.log('Energy status:', res2.status);
    console.log(await res2.text());
    
    process.exit(0);
}
run().catch(console.error);
