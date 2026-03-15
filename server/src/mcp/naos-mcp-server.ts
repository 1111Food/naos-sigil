import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { supabase } from '../lib/supabase';
import { CoherenceService } from '../modules/coherence/service';
import { sendProactiveMessage } from '../modules/sigil/telegramService';

// Initialize the MCP Server
const server = new Server(
    {
        name: 'naos-mcp-server',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'get_architect_due_habits',
                description: 'Identifies users who require a proactive intervention based on their tuning preferences.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            },
            {
                name: 'get_architect_context',
                description: 'Retrieves the complete energetic, coherent, and historical context of a specific user.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'The UUID of the user.' },
                    },
                    required: ['userId'],
                },
            },
            {
                name: 'deliver_astral_nudge',
                description: 'Delivers a mystical proactive message to the user via Telegram or system output.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        message: { type: 'string' },
                        aspect: { type: 'string', description: 'The habit or element triggered (e.g., Fuego, Protocolo21).' },
                        moduleType: { type: 'string', description: 'The module source (e.g., protocol21, elemental_lab).' },
                        buttonLabel: { type: 'string', description: 'Optional text for an interactive button.' },
                        buttonUrl: { type: 'string', description: 'Optional deep link or URL for the button.' },
                    },
                    required: ['userId', 'message', 'aspect'],
                },
            },
        ],
    };
});

// Implement tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'get_architect_due_habits') {
        try {
            // Buscamos todas las preferencias activas
            const { data: tunings, error } = await supabase
                .from('coherence_tunings')
                .select('user_id, aspect, module_type, cron_schedule, last_triggered_at')
                .eq('is_active', true);

            if (error) throw error;

            const now = new Date();
            const nowMs = now.getTime();

            const due = (tunings || []).filter((t: any) => {
                if (!t.cron_schedule) return false;

                // Formato esperado: "08:30,20:00"
                const times = t.cron_schedule.split(',');

                for (const time of times) {
                    const [hh, mm] = time.trim().split(':');
                    if (!hh || !mm) continue;

                    const userOffset = -6; // Fallback para Guatemala (UTC-6)
                    const scheduledToday = new Date();
                    // scheduledToday está en UTC. Calculamos el instante exacto en UTC que corresponde a la hora local.
                    // Ej: 08:00 Local => 08 - (-6) = 14:00 UTC
                    scheduledToday.setUTCHours(parseInt(hh, 10) - userOffset, parseInt(mm, 10), 0, 0);
                    const scheduledTimeMs = scheduledToday.getTime();

                    // Ventana de tolerancia: Si estamos hasta 60 minutos después de la hora programada
                    if (nowMs >= scheduledTimeMs && nowMs <= scheduledTimeMs + (60 * 60 * 1000)) {
                        // Verificamos si ya se disparó HOY después de esta hora específica
                        if (!t.last_triggered_at) return true;

                        const lastTriggered = new Date(t.last_triggered_at).getTime();
                        if (lastTriggered < scheduledTimeMs) {
                            return true; // No se ha disparado para este ciclo
                        }
                    }
                }
                return false;
            });

            return {
                content: [{ type: 'text', text: JSON.stringify(due) }],
            };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }

    if (name === 'get_architect_context') {
        const { userId } = args as { userId: string };
        try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            const coherence = await CoherenceService.getCoherence(userId);

            // Fetch active protocol for project/purpose anchoring
            const { data: protocol } = await supabase
                .from('protocols')
                .select('title, purpose')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const ctx = {
                profile,
                coherence: {
                    global: coherence.global_coherence,
                    discipline: coherence.discipline_score,
                    energy: coherence.energy_score,
                    clarity: coherence.clarity_score,
                },
                protocol: {
                    projectName: protocol?.title || 'Protocolo NAOS',
                    purpose: protocol?.purpose || 'Evolución y Maestría'
                },
                lastInteraction: coherence.last_interaction_at
            };

            return {
                content: [{ type: 'text', text: JSON.stringify(ctx) }],
            };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }

    if (name === 'deliver_astral_nudge') {
        const { userId, message, aspect, moduleType, buttonLabel, buttonUrl } = args as {
            userId: string;
            message: string;
            aspect: string;
            moduleType: string;
            buttonLabel?: string;
            buttonUrl?: string;
        };
        try {
            console.log(`\n🌌 [MCP_SIGIL] Preparing to deliver proactive nudge to ${userId} (Module: ${moduleType}, Aspect: ${aspect})...`);

            // Fetch Telegram Chat ID
            const { data: profileData } = await supabase.from('profiles').select('telegram_chat_id').eq('id', userId).single();
            const telegramChatId = profileData?.telegram_chat_id;

            if (telegramChatId) {
                const button = buttonLabel && buttonUrl ? { label: buttonLabel, url: buttonUrl } : undefined;
                const delivered = await sendProactiveMessage(telegramChatId, message, button);
                if (!delivered) {
                    console.warn(`[MCP_SIGIL] Warning: Message delivery to Telegram ${telegramChatId} failed (Offline or network error).`);
                }
            } else {
                console.log(`[MCP_SIGIL] User ${userId} has not completed the Recognition Protocol (No telegram_chat_id). Nudge stored only in DB.`);
            }

            // Log interaction as proactive
            await supabase.from('interaction_logs').insert({
                user_id: userId,
                user_message: `[PROACTIVE_TRIGGER: ${moduleType}/${aspect}]`,
                sigil_response: message
            });

            // Update last triggered
            await supabase.from('coherence_tunings')
                .update({ last_triggered_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('module_type', moduleType || 'protocol21')
                .eq('aspect', aspect);

            return {
                content: [{ type: 'text', text: `Message delivered and logged for ${userId}.` }],
            };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }

    throw new Error(`Unknown tool: ${name}`);
});

// Run server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('🕯️ NAOS MCP Server running on stdio');
}

main().catch(console.error);
