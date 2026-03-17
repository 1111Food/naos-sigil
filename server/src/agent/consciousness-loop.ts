import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import path from 'path';

const TICK_INTERVAL_MS = 60 * 1000; // Check every 1 minute
const isProd = __dirname.includes('dist') || process.env.NODE_ENV === 'production';
const MCP_SERVER_PATH = path.join(__dirname, `../mcp/naos-mcp-server.${isProd ? 'js' : 'ts'}`);

const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function createMcpClient() {
    const transport = new StdioClientTransport({
        command: 'npx',
        args: ['tsx', MCP_SERVER_PATH],
    });

    const client = new Client(
        { name: 'naos-sigil-consciousness', version: '1.0.0' },
        { capabilities: {} }
    );

    await client.connect(transport);
    return client;
}

async function wakeUpConsciousness(client: Client) {
    // DIAGNÓSTICO TEMPORAL DE EMAIL
    // Note: 'supabase' is not defined in this file. This block will cause a runtime error.
    // Assuming 'supabase' would be imported or defined elsewhere for this diagnostic to work.
    // For now, commenting out to maintain syntactical correctness of the provided file.
    /*
    try {
        const { data: p } = await supabase.from('profiles').select('email').eq('id', '0ee073e8-2e4e-4cff-b947-c7185fb75975').single();
        console.log("=== TARGET EMAIL DE 0ee ===", p?.email);
    } catch (err) {}
    */

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

            const isLab = habit.module_type === 'elemental_lab';

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

            console.log(`[SIGIL_CONSCIOUSNESS] Dreaming a response via Gemini...`);
            const chatResult = await model.generateContent(systemPrompt);
            const mysticNudge = chatResult.response.text();

            // 4. Logic for Habit-Specific Buttons
            let buttonLabel: string | undefined;
            let buttonUrl: string | undefined;

            const aspectLower = habit.aspect.toLowerCase();

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

        // First run
        wakeUpConsciousness(client);

        // Schedule
        setInterval(() => {
            wakeUpConsciousness(client);
        }, TICK_INTERVAL_MS);

    } catch (err) {
        console.error("🔥 Sigil Agent Loop: FATAL CRASH", err);
        process.exit(1);
    }
}

// If invoked directly
if (require.main === module) {
    startDaemon();
}

export { startDaemon, wakeUpConsciousness };
