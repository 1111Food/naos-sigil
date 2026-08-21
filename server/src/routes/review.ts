import { FastifyInstance } from 'fastify';

export async function reviewRoutes(app: FastifyInstance) {
    app.get('/state', async (request, reply) => {
        // Return a static map of the Review Mode
        const state = {
            "mode": "review",
            "screen": "temple",
            "step": 5,
            "title": "NAOS Temple",
            "description": "Main personal intelligence dashboard",
            "available_actions": [
                {
                    "id": "open_identity",
                    "label": "Open Identity",
                    "url": "/review/identity"
                },
                {
                    "id": "open_sigil",
                    "label": "Open Sigil",
                    "url": "/review/sigil"
                },
                {
                    "id": "open_timemap",
                    "label": "Open Time Map",
                    "url": "/review/timemap"
                },
                {
                    "id": "open_synastry",
                    "label": "Open Synastry",
                    "url": "/review/synastry"
                },
                {
                    "id": "open_sanctuary",
                    "label": "Open Sanctuary",
                    "url": "/review/sanctuary"
                },
                {
                    "id": "open_oracle",
                    "label": "Open Oracle",
                    "url": "/review/oracle"
                },
                {
                    "id": "open_premium",
                    "label": "Open Premium",
                    "url": "/review/premium"
                }
            ]
        };

        return reply.status(200).send(state);
    });
}
