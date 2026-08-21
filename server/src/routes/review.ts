import { FastifyInstance } from 'fastify';

export async function reviewRoutes(app: FastifyInstance) {
    app.get('/state', async (request, reply) => {
        const query = request.query as { screen?: string, scenario?: string };
        const screen = query.screen || 'temple';
        const scenario = query.scenario || 'active';

        if (screen === 'protocol21') {
            let dayCurrent = 1;
            let targetDays = 21;
            let status = 'active';
            let protocolStage = '21_DAYS';

            if (scenario === 'awaiting_evolution') {
                dayCurrent = 21;
                status = 'awaiting_evolution';
            } else if (scenario === '90_days') {
                dayCurrent = 22;
                targetDays = 90;
                protocolStage = '90_DAYS';
            }
            
            const getProtocol21Phase = (day: number) => {
                if (day >= 1 && day <= 6) return 'BUILD';
                if (day === 7) return 'REFLECT';
                if (day >= 8 && day <= 13) return 'DEEPEN';
                if (day === 14) return 'RECALIBRATE';
                if (day >= 15 && day <= 20) return 'INTEGRATE';
                if (day === 21) return 'EVOLVE';
                return 'TRANSFORM';
            };

            return reply.status(200).send({
                "mode": "review",
                "scenario": scenario,
                "is_demo": true,
                "screen": "protocol21",
                "title": "Protocol 21",
                "description": "21-Day transformational habit protocol",
                "state": {
                    "day_current": dayCurrent,
                    "day_total": targetDays,
                    "progress_percent": Number(((dayCurrent / targetDays) * 100).toFixed(2)),
                    "phase": getProtocol21Phase(dayCurrent), // Note: Phases are currently VISUAL ONLY in UX.
                    "ritual_status": "available",
                    "vault_available": true,
                    "history_available": true,
                    "intentions": [],
                    "sigil": {
                        "reflection_available": false,
                        "memory_created": false
                    },
                    "protocol21": {
                        "protocol_stage": protocolStage,
                        "status": status,
                        "current_day": dayCurrent,
                        "target_days": targetDays,
                        "completed": false
                    },
                    "protocol90": {
                        "protocol_stage": "90_DAYS",
                        "status": scenario === '90_days' ? 'active' : 'locked',
                        "unlocked": scenario === '90_days'
                    }
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
                    { "id": "start_ritual", "label": "Start Ritual", "url": null, "type": "action" },
                    { "id": "open_vault", "label": "Open Vault", "url": "/review/protocol21/vault", "type": "action" },
                    { "id": "open_history", "label": "View History", "url": "/review/protocol21/history", "type": "action" },
                    { "id": "reflect_with_sigil", "label": "Reflect with Sigil", "url": null, "type": "action" },
                    { "id": "back_temple", "label": "Back to Temple", "url": "/review/temple", "type": "link" }
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
