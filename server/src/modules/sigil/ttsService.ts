import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../../config/env';

const CACHE_DIR = path.join(process.cwd(), 'tts-cache');

export class TTSService {

    constructor() {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
    }

    private getHash(text: string): string {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    /**
     * Converts Sigil text message to an audio buffer using ElevenLabs,
     * caching on local filesystem to optimize quotas and loads.
     */
    public async generateVoice(text: string): Promise<{ buffer: Buffer | null, hash: string }> {
        const hash = this.getHash(text);
        const cachePath = path.join(CACHE_DIR, `${hash}.mp3`);

        // 1. Check Cache
        if (fs.existsSync(cachePath)) {
            console.log(`🔊 [TTS] Cache HIT for hash [${hash}]`);
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

        try {
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': config.ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.85,
                        similarity_boost: 0.8,
                        style: 0.0,
                        use_speaker_boost: true
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`ElevenLabs Error: ${response.status} - ${errText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Save to Cache
            fs.writeFileSync(cachePath, buffer);
            console.log(`🔊 [TTS] Audio cached at ${cachePath}`);

            return { buffer, hash };

        } catch (e) {
            console.error("🔥 [TTS] Audio generation failed:", e);
            return { buffer: null, hash };
        }
    }

    public getAudioPath(hash: string): string | null {
         const cachePath = path.join(CACHE_DIR, `${hash}.mp3`);
         return fs.existsSync(cachePath) ? cachePath : null;
    }
}
