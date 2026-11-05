import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { config } from '../config/env';
import { generateProactiveNudge, GeminiNudgeError } from './geminiNudge';
import { createSingleFlight } from './singleFlight';
import fs from 'fs';
import path from 'path';

const TICK_INTERVAL_MS = 60 * 1000; // Check every 1 minute
const jsCandidatePath = path.join(__dirname, '../mcp/naos-mcp-server.js');
const tsCandidatePath = path.join(__dirname, '../mcp/naos-mcp-server.ts');
const useCompiledJs = __filename.endsWith('.js') && fs.existsSync(jsCandidatePath);
const MCP_SERVER_PATH = useCompiledJs ? jsCandidatePath : tsCandidatePath;

const TSX_PREFLIGHT_SUFFIX = path.join('node_modules', 'tsx', 'dist', 'preflight.cjs');
const TSX_LOADER_URL_SUFFIX = '/node_modules/tsx/dist/loader.mjs';

const FLAGS_TAKING_NEXT_ARG = new Set([
    '-e', '--eval',
    '-p', '--print',
    '-r', '--require',
    '--import', '--loader', '--experimental-loader',
    '--inspect-port', '--debug-port',
    '--watch-path',
    '-C', '--conditions',
]);

export function isValidTsxPreflightPath(value: string): boolean {
    if (typeof value !== 'string' || value.length === 0 || value.includes('..')) {
        return false;
    }
    const normalized = path.normalize(value);
    if (normalized.includes('..')) {
        return false;
    }
    return (
        normalized === TSX_PREFLIGHT_SUFFIX ||
        normalized.endsWith(path.sep + TSX_PREFLIGHT_SUFFIX)
    );
}

export function isValidTsxLoaderUrl(value: string): boolean {
    if (typeof value !== 'string' || !value.startsWith('file:///') || value.includes('..')) {
        return false;
    }
    try {
        const parsed = new URL(value);
        return (
            parsed.protocol === 'file:' &&
            !parsed.pathname.includes('..') &&
            parsed.pathname.endsWith(TSX_LOADER_URL_SUFFIX)
        );
    } catch {
        return false;
    }
}

export function buildSafeExecArgv(
    execArgv: readonly string[] = process.execArgv,
    compiledJs: boolean = useCompiledJs
): string[] {
    if (compiledJs) {
        return [];
    }

    let validPreflight: string | null = null;
    let validLoader: string | null = null;

    for (let i = 0; i < execArgv.length; i++) {
        const arg = execArgv[i];
        const next = execArgv[i + 1];

        if (arg === '--require' && typeof next === 'string') {
            if (isValidTsxPreflightPath(next) && validPreflight === null) {
                validPreflight = next;
            } else {
                console.error(`[MCP_STARTUP_GUARD] Rejected non-allowlisted --require target in execArgv: ${next}`);
            }
            i++;
            continue;
        }

        if (arg === '--import' && typeof next === 'string') {
            if (isValidTsxLoaderUrl(next) && validLoader === null) {
                validLoader = next;
            } else {
                console.error(`[MCP_STARTUP_GUARD] Rejected non-allowlisted --import target in execArgv: ${next}`);
            }
            i++;
            continue;
        }

        if (FLAGS_TAKING_NEXT_ARG.has(arg) && typeof next === 'string' && !next.startsWith('-')) {
            console.error(`[MCP_STARTUP_GUARD] Rejected non-allowlisted execArgv flag and value: ${arg}`);
            i++;
            continue;
        }

        if (
            (arg === '--inspect' || arg === '--inspect-brk' || arg === '--debug' || arg === '--debug-brk') &&
            typeof next === 'string' &&
            /^([\w.-]+:)?\d+$/.test(next)
        ) {
            console.error(`[MCP_STARTUP_GUARD] Rejected non-allowlisted debugger flag and port in execArgv: ${arg}`);
            i++;
            continue;
        }

        console.error(`[MCP_STARTUP_GUARD] Rejected non-allowlisted execArgv argument: ${arg}`);
    }

    if (!validPreflight || !validLoader) {
        console.error(
            `[MCP_STARTUP_GUARD] Incomplete TSX loader contract in execArgv (preflight=${Boolean(validPreflight)}, loader=${Boolean(validLoader)}). Refusing to propagate partial hooks.`
        );
        return [];
    }

    return ['--require', validPreflight, '--import', validLoader];
}

export const MCP_ALLOWED_ENV_KEYS = [
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'GOOGLE_API_KEY',
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_RUNTIME_ENABLED',
    'TELEGRAM_TEST_MODE',
    'TELEGRAM_TEST_USER_ID',
] as const;

export function buildMcpEnv(sourceEnv: NodeJS.ProcessEnv = process.env): Record<string, string> {
    const env: Record<string, string> = {};
    for (const key of MCP_ALLOWED_ENV_KEYS) {
        const value = sourceEnv[key];
        if (typeof value === 'string' && value.length > 0) {
            env[key] = value;
        }
    }
    return env;
}

async function createMcpClient() {
    const safeExecArgv = buildSafeExecArgv();
    const transport = new StdioClientTransport({
        command: process.execPath,
        args: [...safeExecArgv, MCP_SERVER_PATH],
        env: buildMcpEnv(),
    });

    const client = new Client(
        { name: 'naos-sigil-consciousness', version: '1.0.0' },
        { capabilities: {} }
    );

    await client.connect(transport);
    return client;
}

async function wakeUpConsciousness(client: Client) {

    console.log(`\n👁️ [SIGIL_CONSCIOUSNESS] Waking up to scan for astral alignments...`);

    try {
        // 1. Ask MCP for users needing a nudge
        const habitsResponse: any = await client.callTool({
            name: 'get_architect_due_habits',
            arguments: {}
        });

        if (habitsResponse.isError) {
            throw new Error(`MCP Error fetching habits: ${habitsResponse.content[0].text}`);
        }

        const habits = JSON.parse(habitsResponse.content[0].text);
        if (habits.length === 0) {
            console.log(`[SIGIL_CONSCIOUSNESS] No architects require intervention at this cycle.`);
            return;
        }

        console.log(`[SIGIL_CONSCIOUSNESS] Found ${habits.length} architects requiring intervention.`);

        // 2. Iterate and process each
        for (const habit of habits) {
            console.log(`[SIGIL_CONSCIOUSNESS] Evaluating context for User ${habit.user_id} (Module: ${habit.module_type}, Aspect: ${habit.aspect})...`);

            const contextResponse: any = await client.callTool({
                name: 'get_architect_context',
                arguments: { userId: habit.user_id }
            });

            if (contextResponse.isError) {
                console.error(`[SIGIL_CONSCIOUSNESS] Error fetching context: ${contextResponse.content[0].text}`);
                continue;
            }

            const contextData = JSON.parse(contextResponse.content[0].text);
            const userName = contextData.profile?.nickname || contextData.profile?.name || 'Arquitecto';
            const projectName = contextData.protocol?.projectName || 'Tu Gran Obra';
            const purpose = contextData.protocol?.purpose || 'Evolución y Maestría';

            const aspectLower = habit.aspect.toLowerCase();
            const isLab = ['fuego', 'agua', 'tierra', 'aire', 'meditación', 'respiración'].some(el => aspectLower.includes(el));

            // 3. Prompt the LLM to generate a mystical suggestion
            let systemPrompt = '';
            if (isLab) {
                systemPrompt = `
Eres el Sigil, el guía espiritual de NAOS.
El usuario ${userName} ha programado un ciclo de sintonización para la práctica: "${habit.aspect}".

[TU MISIÓN MÍSTICA]
Redacta un recordatorio MUY CORTO (MÁXIMO 2 LÍNEAS), inmersivo y místico.
Invítalo a detener su día por unos minutos para equilibrar su energía a través de este elemento.
No des explicaciones largas. Solo invoca la presencia en la práctica.
El mensaje será enviado a Telegram.
                `;
            } else if (habit.module_type === 'protocol21' || habit.aspect.includes('21')) {
                systemPrompt = `
Eres el Sigil, el guía espiritual hiper-personalizado de la plataforma NAOS.
El usuario ${userName} ha activado el Protocolo 21 (Autocontrol y Disciplina).

[TU MISIÓN MÍSTICA]
Redacta un recordatorio EXTREMADAMENTE BREVE (MÁXIMO 3 LÍNEAS).
Tu objetivo es recordarle amablemente sostener su coherencia: "Recuerda alimentarte con consciencia y vigilar tus pensamientos hoy".
Mantén tu tono de Mago Protector. El mensaje se le enviará por Telegram a su reloj o celular, no lo satures de texto. No uses emojis excesivos.
                `;
            } else {
                systemPrompt = `
Eres el Sigil, el guía espiritual hiper-personalizado de la plataforma NAOS.
El usuario ${userName} está trabajando en su proyecto: "${projectName}", con el propósito de: "${purpose}".

[TU MISIÓN MÍSTICA]
Formula un MENSAJE PROACTIVO sutil, elegante y muy breve (MÁXIMO 4 LÍNEAS).
Tu objetivo es sugerirle amablemente que es hora de atender su aspecto de ${habit.aspect}.

REGLA DE ORO: Debes anclar la motivación de este hábito (${habit.aspect}) OBLIGATORIAMENTE a su proyecto "${projectName}" y su propósito "${purpose}". 
El usuario debe sentir que realizar esta acción hoy es un paso directo hacia su meta mayor.

No suenes a alarma de reloj. Suena a un espíritu protector que le invoca al equilibrio.
Acaba el mensaje con una pregunta abierta retórica (ej. "¿Sientes el llamado?").
El mensaje será inyectado asíncronamente en su canal de Telegram.

[CONTEXTO RECIENTE]
Coherencia Global: ${contextData.coherence.global.toFixed(1)}%
Última interacción registrada: ${contextData.lastInteraction}
                `;
            }

            console.log('[SIGIL_CONSCIOUSNESS] Generating a proactive nudge with configured Gemini model...');
            let mysticNudge: string;
            try {
                mysticNudge = await generateProactiveNudge(systemPrompt, {
                    apiKey: config.GOOGLE_API_KEY,
                    model: config.GEMINI_MODEL,
                });
            } catch (error) {
                const reason = error instanceof GeminiNudgeError ? error.code : 'GEMINI_NUDGE_UNEXPECTED_ERROR';
                console.error('[SIGIL_CONSCIOUSNESS] Skipping nudge due to generation failure: ' + reason);
                continue;
            }

            // 4. Logic for Habit-Specific Buttons
            let buttonLabel: string | undefined;
            let buttonUrl: string | undefined;

            if (isLab) {
                buttonLabel = `✨ Iniciar ${habit.aspect}`;
                // Determine deep link based on practice name or type
                buttonUrl = "https://naos.app/lab";
                if (aspectLower.includes('respiración') || aspectLower.includes('breath')) buttonUrl = "https://naos.app/lab/breath";
                if (aspectLower.includes('meditación') || aspectLower.includes('meditation')) buttonUrl = "https://naos.app/lab/meditation";
            } else {
                if (aspectLower === 'conexion' || aspectLower === 'connection') {
                    buttonLabel = "🧘 Iniciar Meditación";
                    buttonUrl = "https://naos.app/sanctuary";
                } else if (aspectLower === 'movimiento' || aspectLower === 'movement') {
                    buttonLabel = "⚡ Activar Cuerpo";
                    buttonUrl = "https://naos.app/movement";
                }
            }

            // 5. Deliver the nudge back via MCP
            console.log(`[SIGIL_CONSCIOUSNESS] Executing delivery vector...`);
            const deliverResponse: any = await client.callTool({
                name: 'deliver_astral_nudge',
                arguments: {
                    userId: habit.user_id,
                    message: mysticNudge,
                    aspect: habit.aspect,
                    moduleType: habit.module_type,
                    buttonLabel,
                    buttonUrl
                }
            });

            if (deliverResponse.isError) {
                console.error(`[SIGIL_CONSCIOUSNESS] Delivery failed: ${deliverResponse.content[0].text}`);
            } else {
                console.log(`[SIGIL_CONSCIOUSNESS] ✅ Delivery success for ${habit.user_id}.`);
            }
        }

    } catch (e) {
        console.error(`[SIGIL_CONSCIOUSNESS] Error during wake cycle:`, e);
    }
}

// Daemon Initialization
async function startDaemon() {
    console.log("🌌 Sigil Agent Loop: INITIALIZING DAEMON...");
    try {
        const client = await createMcpClient();
        console.log("🌌 Sigil Agent Loop: CONNECTED TO MCP SERVER.");

        // At most one consciousness cycle per process at a time.
        // Skipping overlapping ticks avoids duplicate concurrent evaluations.
        const runOnce = createSingleFlight(() => wakeUpConsciousness(client));
        const tick = () => {
            void runOnce().catch(() => {
                console.error('[SIGIL_CONSCIOUSNESS] Cycle unexpectedly failed: LOOP_FAILURE');
            });
        };

        tick();
        setInterval(tick, TICK_INTERVAL_MS);

    } catch (err) {
        console.error("🔥 Sigil Agent Loop: CRASHED during startup, but allowing main server to continue.", err);
    }
}

// If invoked directly
if (require.main === module) {
    startDaemon();
}

export { startDaemon, wakeUpConsciousness, createMcpClient, MCP_SERVER_PATH };
