import fs from 'fs';

let envContent = fs.readFileSync('server/src/config/env.ts', 'utf8');
const searchConfig = `    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY\n};`;
const replaceConfig = `    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,\n    TELEGRAM_RUNTIME_ENABLED: process.env.TELEGRAM_RUNTIME_ENABLED === 'true',\n    TELEGRAM_TEST_MODE: process.env.TELEGRAM_TEST_MODE === 'true',\n    TELEGRAM_TEST_USER_ID: process.env.TELEGRAM_TEST_USER_ID // Founder UUID\n};`;
envContent = envContent.replace(searchConfig, replaceConfig);
fs.writeFileSync('server/src/config/env.ts', envContent);

let telContent = fs.readFileSync('server/src/modules/sigil/telegramService.ts', 'utf8');

// Replace initTelegramBot to respect TELEGRAM_RUNTIME_ENABLED and TELEGRAM_TEST_MODE
const searchInit = `export const initTelegramBot = () => {\n    if (bot) return;\n    try {`;
const replaceInit = `export const initTelegramBot = () => {\n    if (bot) return;\n    if (!config.TELEGRAM_RUNTIME_ENABLED && !config.TELEGRAM_TEST_MODE) {\n        console.log("? [TELEGRAM] Runtime disabled. Skipping polling init.");\n        return;\n    }\n    try {`;
telContent = telContent.replace(searchInit, replaceInit);

// Add gate to sendProactiveMessage
const searchSendMsg = `export const sendProactiveMessage = async (telegramChatId: string, message: string, button?: { label: string; url: string }): Promise<boolean> => {`;
const replaceSendMsg = `export const sendProactiveMessage = async (telegramChatId: string, message: string, button?: { label: string; url: string }): Promise<boolean> => {\n    // GUARD: Development safety\n    if (!config.TELEGRAM_RUNTIME_ENABLED && !config.TELEGRAM_TEST_MODE) {\n        console.log(\`[TELEGRAM_GUARD] Suppressed message to \${telegramChatId}: \${message.substring(0, 50)}...\`);\n        return true;\n    }\n\n    if (config.TELEGRAM_TEST_MODE) {\n        // In test mode, we must verify this telegramChatId belongs to the TELEGRAM_TEST_USER_ID (Founder)\n        const { data: userLink } = await supabase.from('profiles').select('telegram_chat_id').eq('id', config.TELEGRAM_TEST_USER_ID).single();\n        if (!userLink || userLink.telegram_chat_id !== telegramChatId) {\n            console.log(\`[TELEGRAM_TEST_GUARD] Suppressed message to \${telegramChatId}, not the founder.\`);\n            return true;\n        }\n    }\n`;
telContent = telContent.replace(searchSendMsg, replaceSendMsg);

// Add gate to sendProactiveVoice
const searchSendVoice = `export const sendProactiveVoice = async (telegramChatId: string, audioBuffer: Buffer, message?: string): Promise<boolean> => {`;
const replaceSendVoice = `export const sendProactiveVoice = async (telegramChatId: string, audioBuffer: Buffer, message?: string): Promise<boolean> => {\n    // GUARD: Development safety\n    if (!config.TELEGRAM_RUNTIME_ENABLED && !config.TELEGRAM_TEST_MODE) {\n        console.log(\`[TELEGRAM_GUARD] Suppressed voice to \${telegramChatId}\`);\n        return true;\n    }\n\n    if (config.TELEGRAM_TEST_MODE) {\n        const { data: userLink } = await supabase.from('profiles').select('telegram_chat_id').eq('id', config.TELEGRAM_TEST_USER_ID).single();\n        if (!userLink || userLink.telegram_chat_id !== telegramChatId) {\n            console.log(\`[TELEGRAM_TEST_GUARD] Suppressed voice to \${telegramChatId}, not the founder.\`);\n            return true;\n        }\n    }\n`;
telContent = telContent.replace(searchSendVoice, replaceSendVoice);

fs.writeFileSync('server/src/modules/sigil/telegramService.ts', telContent);
console.log("Updated Telegram safeguards");
