import { supabase } from '../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONSCIOUSNESS_PROMPTS } from './ConsciousnessPrompts';
import { config } from '../../config/env';
import { UserService } from '../user/service';
import { DailyContextOrchestrator } from '../daily/DailyContextOrchestrator';

export type TransmissionMoment = 'MORNING' | 'EVENING';

export class ConsciousnessEngine {
    private static TARGET_MODEL = config.GEMINI_MODEL;
    
    /**
     * Generates a daily transmission crossing user's deep data with today's energy
     */
    static async generateTransmission(userId: string, moment: TransmissionMoment, lang: 'es' | 'en' = 'es'): Promise<{text: string, arch: string}> {
        console.log(`[CONSCIOUSNESS_ENGINE] Generating ${moment} for ${userId}`);
        
        // 1. Fetch user data (basic + astrology + metrics)
        const userProfile = await UserService.getProfile(userId);
        if (!userProfile) throw new Error("User not found");
        
        const isEn = lang === 'en';
        const name = userProfile.nickname || userProfile.name || 'Arquitecto';
        const arch = userProfile.canonical_archetype?.nombre || (isEn ? 'Architect' : 'Arquitecto');

        // 2. Fetch Canonical Daily Context (V2Payload)
        const offset = 0; // Default offset
        const v2Payload = await DailyContextOrchestrator.getOrGenerate(userId, userProfile, offset, lang);

        // 3. Construct System Prompt
        const sysPromptTemplate = CONSCIOUSNESS_PROMPTS[lang][moment];
        
        const systemPrompt = sysPromptTemplate
            .replace('{name}', name)
            .replace('{archetype}', arch)
            .replace('{daily_context}', JSON.stringify(v2Payload.layerA, null, 2));

        // 4. Generate via Gemini
        const apiKey = config.GOOGLE_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.TARGET_MODEL}:generateContent?key=${apiKey}`;

        const payload = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: 'Please provide my transmission based on the Daily Context provided in the system instruction.' }] }],
            generationConfig: { temperature: 0.7 }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("[CONSCIOUSNESS_ENGINE] Error generating transmission", await response.json());
            throw new Error("Failed to generate transmission");
        }

        const json = await response.json();
        const text = json.candidates[0].content.parts[0].text;
        
        return { text, arch };
    }

    /**
     * Attempts to send a transmission but checks DB first to prevent duplicates.
     */
    static async trySendTransmission(userId: string, date: string, moment: TransmissionMoment, lang: 'es' | 'en'): Promise<string | null> {
        // Check if already sent
        const { data: existing } = await supabase
            .from('sigil_daily_transmissions')
            .select('id, was_sent')
            .eq('user_id', userId)
            .eq('date', date)
            .eq('moment', moment)
            .maybeSingle();
            
        if (existing?.was_sent) {
            console.log(`[CONSCIOUSNESS_ENGINE] ${moment} already sent today for ${userId}`);
            return null;
        }

        // Generate it
        const { text: transmissionText, arch: archetypeUsed } = await this.generateTransmission(userId, moment, lang);

        // Save it to DB
        await supabase
            .from('sigil_daily_transmissions')
            .upsert({
                user_id: userId,
                date: date,
                moment: moment,
                transmission: transmissionText,
                was_sent: true,
                sent_at: new Date().toISOString(),
                archetype_used: archetypeUsed,
                delivery_channel: 'telegram',
                scheduler_runtime_version: 'v3',
                canonical_daily_context_version: 'v2_daily_context'
            }, { onConflict: 'user_id,date,moment' });
            
        return transmissionText;
    }
}

