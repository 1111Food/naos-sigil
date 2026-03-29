import { buildApp } from './app';
import { config } from './config/env';
import { startDaemon } from './agent/consciousness-loop';
import { initTelegramBot } from './modules/sigil/telegramService';
import { NotificationEngine } from './modules/notifications/NotificationEngine';

// Global error handlers to prevent hanging processes
process.on('uncaughtException', (err) => {
    console.error('🔥 UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
    process.exit(1);
});

import fs from 'fs';
import path from 'path';

/*
// DEBUG REDIRECTION
import util from 'util';
const logFile = fs.createWriteStream(path.join(process.cwd(), 'debug_server.log'), { flags: 'a' });
const formatArgs = (args: any[]) => args.map(arg => typeof arg === 'object' ? util.inspect(arg, { depth: null }) : arg).join(' ');

console.log = (...args) => logFile.write(`[LOG] ${new Date().toISOString()} ${formatArgs(args)}\n`);
console.error = (...args) => logFile.write(`[ERROR] ${new Date().toISOString()} ${formatArgs(args)}\n`);
console.warn = (...args) => logFile.write(`[WARN] ${new Date().toISOString()} ${formatArgs(args)}\n`);
*/

const start = async () => {
    try {
        console.log("🔍 DIAGNOSTIC: Checking Env Vars...");
        console.log("   -> SUPABASE_URL:", config.SUPABASE_URL ? config.SUPABASE_URL.substring(0, 15) + "..." : "UNDEFINED");
        console.log("   -> SERVER_KEY:", config.SUPABASE_ANON_KEY ? config.SUPABASE_ANON_KEY.substring(0, 5) + "..." : "UNDEFINED");

        const app = await buildApp();

        // Listen configuration
        await app.listen({
            port: Number(config.PORT),
            host: '0.0.0.0'
        });

        console.log(`✅ Server running at http://localhost:${config.PORT}`);
        console.log(`📂 CWD: ${process.cwd()}`);
        console.log(`🚀 SIGIL V2.0 ACTIVE: Powered by Gemini Flash Latest`);
        console.log(`🌐 Network: http://192.168.1.72:${config.PORT}`);

        // AWAKEN TELEGRAM BOT (RECOGNITION PROTOCOL)
        initTelegramBot();

        // AWAKEN THE CONSCIOUSNESS LOOP (MCP)
        startDaemon().catch(err => {
            console.error("🔥 Agent Loop failed to start:", err);
        });

        // AWAKEN THE NOTIFICATION ENGINE (PROACTIVE REMINDERS - UNIFIED HUB)
        NotificationEngine.scheduleDaemon();

    } catch (err: any) {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ FATAL: Port ${config.PORT} is already tied to another cosmic process.`);
            console.error("💡 Action: The system should have attempted cleanup. If this persists, manually kill the process.");
        } else {
            console.error("❌ FATAL: Server failed to manifest:", err);
        }
        process.exit(1);
    }
};

start();

// Tsx Watch Trigger: 1