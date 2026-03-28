import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory (standard for this backend)
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
    PORT: process.env.PORT || 3001,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    ASTROLOGY_API_USER_ID: process.env.ASTROLOGY_API_USER_ID,
    ASTROLOGY_API_KEY: process.env.ASTROLOGY_API_KEY,
    ASTROLOGY_API_ENDPOINT: process.env.ASTROLOGY_API_ENDPOINT || 'https://json.astrologyapi.com/v1',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || 'pNIn7v95S7XRE96R9rY0',
    LEMON_SQUEEZY_WEBHOOK_SECRET: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

// Debug log (masked)
const usedKey = config.GOOGLE_API_KEY || "(EMPTY)";
console.log(`📡 Cosmic Config: GOOGLE_API_KEY detected? ${config.GOOGLE_API_KEY ? 'YES' : 'NO'} (${usedKey.substring(0, 4)}...)`);

if (!config.GOOGLE_API_KEY) {
    console.error("❌ CRITICAL: GOOGLE_API_KEY is missing. Production AI will fail.");
}
