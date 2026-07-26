import { supabase } from '../../lib/supabase';
import { UserService } from '../user/service';
import { ForecastCalculator } from '../forecast/calculator';
import { LifelinePromptBuilder } from './promptBuilder';
import { LifelineEngine } from './engine';

export class LifelineService {
    
    static async getLifeline(userId: string, language: string = 'es') {
        const { data, error } = await supabase
            .from('user_lifelines')
            .select('*')
            .eq('user_id', userId)
            .eq('language', language)
            .maybeSingle();

        if (error) throw error;
        return data; // Returns null if not exists, which is perfect to trigger generation
    }

    static async generateLifeline(userId: string, language: string = 'es') {
        console.log(`🌀 LifelineService: Generating Eje Evolutivo for user ${userId} [${language}]`);
        
        // 1. Get User Data
        const profile = await UserService.getProfile(userId);
        if (!profile.birthDate) {
            throw new Error("Se requiere fecha de nacimiento para el Eje Evolutivo.");
        }

        // 2. Calculate Pinnacles
        const pinnacles = ForecastCalculator.getPinnacles(profile.birthDate);

        // 3. Calculate Current Personal Year (9-Year Cycle)
        const [bYear, bMonth, bDay] = profile.birthDate.split('-').map(Number);
        const reduceToSingleDigit = (num: number) => {
            while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
                num = String(num).split('').map(Number).reduce((a, b) => a + b, 0);
            }
            return num;
        };
        const currentYear = new Date().getFullYear();
        const personalYear = reduceToSingleDigit(reduceToSingleDigit(bDay) + reduceToSingleDigit(bMonth) + reduceToSingleDigit(currentYear));

        // 4. Build Mega-Prompt
        const prompt = LifelinePromptBuilder.build(profile, pinnacles, personalYear, language);

        // 5. Execute AI Engine
        const lifelineData = await LifelineEngine.generate(prompt);

        // 6. Save to Database Permanently (with fallback for UI resilience)
        try {
            const { data: savedLifeline, error } = await supabase
                .from('user_lifelines')
                .upsert({
                    user_id: userId,
                    language: language,
                    pinnacles: lifelineData.pinnacles,
                    current_cycle: lifelineData.current_cycle,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, language' })
                .select('*')
                .single();

            if (!error && savedLifeline) {
                return savedLifeline;
            }
        } catch (dbErr) {
            console.warn("⚠️ LifelineService DB save warning:", dbErr);
        }

        return {
            user_id: userId,
            language: language,
            pinnacles: lifelineData.pinnacles,
            current_cycle: lifelineData.current_cycle
        };
    }
}
