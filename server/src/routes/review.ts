import { FastifyInstance } from 'fastify';

export async function reviewRoutes(app: FastifyInstance) {
    app.get('/state', async (request, reply) => {
        const query = request.query as { screen?: string };
        const screen = query.screen || 'temple';

        if (screen === 'protocol21') {
            return reply.status(200).send({
                "mode": "review",
                "screen": "protocol21",
                "title": "Protocol 21",
                "description": "21-Day transformational habit protocol",
                "state": {
                    "day_current": 1,
                    "day_total": 21,
                    "progress_percent": 4.76,
                    "ritual_status": "available",
                    "vault_available": true,
                    "history_available": true
                },
                "components": [
                    "header",
                    "progreso",
                    "ritual_del_dia",
                    "la_boveda",
                    "registro_evolutivo",
                    "acciones_principales"
                ],
                "available_actions": [
                    { "id": "start_ritual", "label": "Start Ritual", "url": "#" },
                    { "id": "open_vault", "label": "Open Vault", "url": "#" },
                    { "id": "open_history", "label": "View History", "url": "#" },
                    { "id": "back_temple", "label": "Back to Temple", "url": "/review/temple" }
                ]
            });
        }

        // Default Temple state
        const state = {
            "mode": "review",
            "screen": "temple",
            "step": 5,
            "title": "NAOS Temple",
            "description": "Main personal intelligence dashboard",
            "available_actions": [
                { "id": "open_identity", "label": "Open Identity", "url": "/review/identity" },
                { "id": "open_sigil", "label": "Open Sigil", "url": "/review/sigil" },
                { "id": "open_timemap", "label": "Open Time Map", "url": "/review/timemap" },
                { "id": "open_synastry", "label": "Open Synastry", "url": "/review/synastry" },
                { "id": "open_sanctuary", "label": "Open Sanctuary", "url": "/review/sanctuary" },
                { "id": "open_protocol21", "label": "Open Protocol 21", "url": "/review/protocol21" },
                { "id": "open_oracle", "label": "Open Oracle", "url": "/review/oracle" },
                { "id": "open_premium", "label": "Open Premium", "url": "/review/premium" }
            ]
        };

        return reply.status(200).send(state);
    });
}
