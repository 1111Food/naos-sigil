import fastify from 'fastify';
import { apiRoutes } from 'C:/Users/l_her/naos-platform/server/src/routes/api';
import { coherenceRoutes } from 'C:/Users/l_her/naos-platform/server/src/routes/coherence';

async function run() {
    const app = fastify();
    // Mock validateUser
    app.decorateRequest('user_id', null);
    app.decorateRequest('user', null);
    app.addHook('onRequest', async (req, reply) => {
        (req as any).user_id = '924e8ee3-83b5-4774-a531-551dec2b097c'; // Real ID from before
        (req as any).user = { id: '924e8ee3-83b5-4774-a531-551dec2b097c', role: 'admin' };
    });
    
    await app.register(apiRoutes);
    await app.register(coherenceRoutes, { prefix: '/api/coherence' });
    
    await app.listen({ port: 3003 });
    console.log("Listening on 3003");
    
    const res = await fetch('http://127.0.0.1:3003/api/coherence');
    console.log("Coherence status:", res.status);
    console.log(await res.text());
    
    const res2 = await fetch('http://127.0.0.1:3003/api/energy/current?lang=es');
    console.log("Energy status:", res2.status);
    console.log(await res2.text());
    
    process.exit(0);
}
run().catch(console.error);
