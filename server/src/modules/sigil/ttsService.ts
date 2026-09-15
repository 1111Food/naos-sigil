import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../../config/env';

const CACHE_DIR = process.env.NODE_ENV === 'production' 
    ? '/tmp/tts-cache' 
    : path.join(process.cwd(), 'tts-cache');

export class TTSService {

    constructor() {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
    }

    private getHash(text: string, region: string): string {
        return crypto.createHash('md5').update(text + region).digest('hex');
    }

    /**
     * Converts Sigil text message to an audio buffer using ElevenLabs,
     * caching on local filesystem to optimize quotas and loads.
     */
    public async generateVoice(userId: string, text: string, region: string = 'global'): Promise<{ buffer: Buffer | null, hash: string, error?: string }> {
        // SEC-F2B.4: Limit payload size to 2500 chars to avoid expensive AI text limits
        if (text.length > 2500) {
            console.warn(`⚠️ [TTS] Text length ${text.length} exceeds 2500. Truncating.`);
            text = text.substring(0, 2500) + "...";
        }

        const hash = this.getHash(text, region);
        const userCacheDir = path.join(CACHE_DIR, userId);
        if (!fs.existsSync(userCacheDir)) {
            fs.mkdirSync(userCacheDir, { recursive: true });
        }
        const cachePath = path.join(userCacheDir, `${hash}.mp3`);

        // 1. Check Cache
        if (fs.existsSync(cachePath)) {
            console.log(`🔊 [TTS] Cache HIT for hash [${hash}] (Region: ${region})`);
            const buffer = fs.readFileSync(cachePath);
            return { buffer, hash };
        }

        // 2. Fetch from ElevenLabs
        if (!config.ELEVENLABS_API_KEY) {
            console.warn("⚠️ [TTS] ElevenLabs API Key missing. Skipping audio generation.");
            return { buffer: null, hash };
        }

        const voiceId = config.ELEVENLABS_VOICE_ID;
        const apiURL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        console.log(`🔊 [TTS] Generating audio via ElevenLabs for hash [${hash}]...`);

        let speed = 1.0;
        if (region === 'north_america') speed = 1.05;
        else if (region === 'latam') speed = 0.95;

        const buildPayload = (includeSpeed: boolean) => ({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.85,
                similarity_boost: 0.8,
                style: 0.0,
                use_speaker_boost: true,
                ...(includeSpeed ? { speed } : {})
            }
        });

        try {
            let response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': config.ELEVENLABS_API_KEY
                },
                body: JSON.stringify(buildPayload(true))
            });

            // Fallback for speed configuration if ElevenLabs API refuses speed parameter
            if (!response.ok) {
                console.warn(`⚠️ [TTS] ElevenLabs rejected speed payload, retrying standard mode...`);
                response = await fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': config.ELEVENLABS_API_KEY
                    },
                    body: JSON.stringify(buildPayload(false))
                });
            }

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`ElevenLabs Error: ${response.status} - ${errText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Save to Cache — failure must not propagate to caller
            try {
                fs.writeFileSync(cachePath, buffer);
                console.log(`🔊 [TTS] Audio cached at ${cachePath}`);
            } catch (cacheErr: any) {
                console.warn(`⚠️ [TTS] Cache write failed (non-fatal): ${cacheErr.message}`);
            }

            return { buffer, hash };

        } catch (e: any) {
            console.error("🔥 [TTS] Audio generation failed:", e);
            return { buffer: null, hash, error: e.message };
        }
    }

    public getAudioPath(userId: string, hash: string): string | null {
         // SEC-F2B.4: Validate Hash and Path Traversal
         if (!/^[a-fA-F0-9]{32}$/.test(hash)) {
             console.warn(`[TTS] Invalid audio hash format requested by ${userId}`);
             return null;
         }

         const userCacheDir = path.resolve(CACHE_DIR, userId);
         const cachePath = path.resolve(userCacheDir, `${hash}.mp3`);
         
         // Path Traversal Security Verification
         if (!cachePath.startsWith(userCacheDir)) {
             console.warn(`[TTS] Path traversal blocked for ${userId}`);
             return null;
         }

         return fs.existsSync(cachePath) ? cachePath : null;
    }
}
