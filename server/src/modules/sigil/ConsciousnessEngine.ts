import { supabase } from '../../lib/supabase';
import { CONSCIOUSNESS_PROMPTS } from './ConsciousnessPrompts';
import { config } from '../../config/env';

export type TransmissionMoment = 'AURORA' | 'ZENITH' | 'VESPER';

export class ConsciousnessEngine {
    private static TARGET_MODEL = "gemini-1.5-pro";
    
    /**
     * Generates a daily transmission crossing user's deep data with today's energy
     */
    static async generateTransmission(userId: string, moment: TransmissionMoment, lang: 'es' | 'en' = 'es'): Promise<string> {
        console.log(`[CONSCIOUSNESS_ENGINE] Generating ${moment} for ${userId}`);
        
        // 1. Fetch user data (basic + astrology + metrics)
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('id, full_name, nickname, profile_data, astrology')
            .eq('id', userId)
            .single();
            
        if (!userProfile) throw new Error("User not found");
        
        const isEn = lang === 'en';
        const name = userProfile.nickname || userProfile.full_name || 'Arquitecto';
        const arch = userProfile.profile_data?.archetype || (isEn ? 'Architect' : 'Arquitecto');

        // 2. Fetch Deep Context (Lifelines & Mission Year)
        const { data: lifelineData } = await supabase
            .from('user_lifelines')
            .select('lifeline_data')
            .eq('user_id', userId)
            .eq('language', lang)
            .maybeSingle();
            
        const { data: forecastData } = await supabase
            .from('mission_year_data')
            .select('data')
            .eq('user_id', userId)
            .eq('language', lang)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // 3. Prepare Bible context
        const bibleContext = `
        User Name: ${name}
        Archetype: ${arch}
        Natal Astrology: Sun ${userProfile.astrology?.sun_sign}, Moon ${userProfile.astrology?.moon_sign}, Ascendant ${userProfile.astrology?.ascendant}
        Current Life Pinnacle: ${lifelineData ? JSON.stringify(lifelineData.lifeline_data) : 'Unknown'}
        Current Mission Year: ${forecastData ? JSON.stringify(forecastData.data) : 'Unknown'}
        Current Date/Time: ${new Date().toLocaleString()}
        `;

        const systemPrompt = CONSCIOUSNESS_PROMPTS[lang][moment];
        
        // 4. Generate via Gemini
        const apiKey = config.GOOGLE_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.TARGET_MODEL}:generateContent?key=${apiKey}`;

        const payload = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: bibleContext }] }],
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
        
        return text;
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
        const transmissionText = await this.generateTransmission(userId, moment, lang);

        // Save it to DB
        await supabase
            .from('sigil_daily_transmissions')
            .upsert({
                user_id: userId,
                date: date,
                moment: moment,
                transmission: transmissionText,
                was_sent: true,
                sent_at: new Date().toISOString()
            }, { onConflict: 'user_id,date,moment' });
            
        return transmissionText;
    }
}
