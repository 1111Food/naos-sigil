import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { supabase } from '../lib/supabase';
import { CoherenceService } from '../modules/coherence/service';
import { sendProactiveMessage } from '../modules/sigil/telegramService';
import { memoryService } from '../modules/memory/MemoryService';

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
            {
                name: 'search_long_term_memory',
                description: 'Searches the user\'s long-term semantic memory using RAG. Use when the user references past conversations, goals, decisions, or relationships.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'The UUID of the user.' },
                        query: { type: 'string', description: 'The search query or context to find relevant memories.' },
                        limit: { type: 'number', description: 'Maximum number of results (default 8).' },
                    },
                    required: ['userId', 'query'],
                },
            },
            {
                name: 'save_long_term_memory',
                description: 'Stores an important insight, decision, or user preference into long-term memory. Only use for significant information worth remembering.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'The UUID of the user.' },
                        content: { type: 'string', description: 'The information to remember.' },
                        moduleSource: { type: 'string', description: 'The module that generated this insight (e.g., sigil, synastry, lifeline).' },
                        entityId: { type: 'string', description: 'Optional entity ID if this memory belongs to a relationship, project, or person.' },
                        entityType: { type: 'string', description: 'Optional entity type: user, relationship, project, team, goal, person.' },
                    },
                    required: ['userId', 'content', 'moduleSource'],
                },
            },
            {
                name: 'evolve_memory',
                description: 'Updates an existing memory by creating a new version while preserving the old one. Use when the user\'s situation, goal, or opinion has changed.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'The UUID of the user.' },
                        oldMemoryId: { type: 'string', description: 'The UUID of the memory to evolve.' },
                        newContent: { type: 'string', description: 'The updated information.' },
                    },
                    required: ['userId', 'oldMemoryId', 'newContent'],
                },
            },
            {
                name: 'get_memory_provenance',
                description: 'Gets the temporal evolution chain of a specific memory — how it changed over time.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        memoryId: { type: 'string', description: 'The UUID of the memory to trace.' },
                    },
                    required: ['memoryId'],
                },
            },
            {
                name: 'list_entity_memories',
                description: 'Lists all memories associated with a specific entity (relationship, project, person).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'The UUID of the user.' },
                        entityId: { type: 'string', description: 'The UUID of the entity.' },
                    },
                    required: ['userId', 'entityId'],
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
                .select('user_id, aspect, cron_schedule, last_triggered_at')
                .eq('is_active', true);

            if (error) throw error;

            if (!tunings || tunings.length === 0) {
                return { content: [{ type: 'text', text: '[]' }] };
            }

            // Hydrate profiles memory-wise to bypass foreign key constraint gap
            const userIds = [...new Set(tunings.map(t => t.user_id))];
            const { data: users } = await supabase
                .from('profiles')
                .select('id, astrology')
                .in('id', userIds);

            const userMap = (users || []).reduce((acc: any, u: any) => {
                acc[u.id] = u;
                return acc;
            }, {});

            const hydratedTunings = tunings.map(t => ({
                ...t,
                profiles: userMap[t.user_id]
            }));

            const now = new Date();
            const nowMs = now.getTime();

            const due = hydratedTunings.filter((t: any) => {
                if (!t.cron_schedule) return false;

                // Formato esperado: "08:30,20:00"
                const times = t.cron_schedule.split(',');

                for (const time of times) {
                    const [hh, mm] = time.trim().split(':');
                    if (!hh || !mm) continue;

                    const userOffset = t.profiles?.astrology?.timezone_offset ?? -6; // Fallback para Guatemala (UTC-6)
                    const scheduledToday = new Date(now);
                    scheduledToday.setUTCHours(parseInt(hh, 10) - userOffset, parseInt(mm, 10), 0, 0);

                    // Corrección de Rollover UTC: Si la hora calculada se desfasa más de 12h por cambio de día de servidor
                    if (scheduledToday.getTime() - nowMs > 12 * 60 * 60 * 1000) {
                        scheduledToday.setUTCDate(scheduledToday.getUTCDate() - 1);
                    } else if (nowMs - scheduledToday.getTime() > 12 * 60 * 60 * 1000) {
                        scheduledToday.setUTCDate(scheduledToday.getUTCDate() + 1);
                    }

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
        const { userId, message, aspect, moduleType = 'system', buttonLabel, buttonUrl } = args as {
            userId: string;
            message: string;
            aspect: string;
            moduleType?: string;
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
                .eq('aspect', aspect);

            return {
                content: [{ type: 'text', text: `Message delivered and logged for ${userId}.` }],
            };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }

    // ═══════════════════════════════════════════════════
    // MEMORY TOOLS (Cognitive Engine)
    // ═══════════════════════════════════════════════════

    if (name === 'search_long_term_memory') {
        const { userId, query, limit = 8 } = args as { userId: string; query: string; limit?: number };
        try {
            const results = await memoryService.recall(userId, query, limit);
            return {
                content: [{ type: 'text', text: JSON.stringify(results) }],
            };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }

    if (name === 'save_long_term_memory') {
        const { userId, content, moduleSource, entityId, entityType } = args as {
            userId: string;
            content: string;
            moduleSource: string;
            entityId?: string;
            entityType?: string;
        };
        try {
            const record = await memoryService.remember({
                user_id: userId,
                content,
                module_source: moduleSource,
                entity_id: entityId,
                entity_type: entityType as any,
                skip_policy: false,
            });
            return {
                content: [{ type: 'text', text: record ? `Memory saved: ${record.id}` : 'Memory not stored (did not pass policy evaluation).' }],
            };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }

    if (name === 'evolve_memory') {
        const { userId, oldMemoryId, newContent } = args as { userId: string; oldMemoryId: string; newContent: string };
        try {
            const evolved = await memoryService.evolve(oldMemoryId, newContent, userId);
            return {
                content: [{ type: 'text', text: evolved ? `Memory evolved: ${evolved.id}` : 'Evolution failed.' }],
            };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }

    if (name === 'get_memory_provenance') {
        const { memoryId } = args as { memoryId: string };
        try {
            const chain = await memoryService.getProvenance(memoryId);
            return {
                content: [{ type: 'text', text: JSON.stringify(chain) }],
            };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }

    if (name === 'list_entity_memories') {
        const { userId, entityId } = args as { userId: string; entityId: string };
        try {
            const memories = await memoryService.listMemories(userId, 50, 0, { entity_id: entityId });
            return {
                content: [{ type: 'text', text: JSON.stringify(memories) }],
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
