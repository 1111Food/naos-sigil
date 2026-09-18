import { supabase } from '../../lib/supabase';
import { AiLedgerService } from '../economics/AiLedgerService';
import { UserService } from '../user/service';
import { ForecastCalculator } from './calculator';
import { ForecastContextInjector } from './contextInjector';
import { ForecastPromptBuilder } from './promptBuilder';
import { ForecastEngine } from './engine';
import { AstroContextBuilder } from '../astrology/AstroContextBuilder';

export class ForecastService {
    
    static async getTimeMap(userId: string, language: string = 'es') {
        const { data, error } = await supabase
            .from('user_time_maps')
            .select('*')
            .eq('user_id', userId)
            .eq('language', language)
            .maybeSingle();

        if (error) throw error;
        
        // Return null if it doesn't exist or if it's expired
        if (!data) return null;
        if (new Date(data.valid_until) < new Date()) return null;
        // Removed astro_context_version check as column does not exist

        return data;
    }

    static async generateTimeMap(userId: string, language: string = 'es') {
        console.log(`ðŸŒ€ ForecastService: Generating Time Map for user ${userId} [${language}]`);
        
        // 1. Get User Data
        const profile = await UserService.getProfile(userId);
        if (!profile.birthDate) {
            throw new Error("Se requiere fecha de nacimiento para el Mapa Temporal.");
        }

        // 2. Get Behavioral Context (5th School)
        const behaviorContext = await ForecastContextInjector.getUserBehaviorContext(userId);

        // 3. Calculate 12-month mathematical cycles and Pinnacles
        const cycles = ForecastCalculator.get12MonthCycles(profile.birthDate);
        const pinnacles = ForecastCalculator.getPinnacles(profile.birthDate);

        // 3.5. Fetch Macro Context
        const { data: macro } = await supabase
            .from('user_lifelines')
            .select('current_cycle')
            .eq('user_id', userId)
            .eq('language', language)
            .maybeSingle();

        // 4. Build Mega-Prompt
        const astroContext = AstroContextBuilder.normalize(profile);
        const prompt = ForecastPromptBuilder.build(profile, astroContext, behaviorContext, cycles, pinnacles, macro?.current_cycle, language);

        // 5. Execute AI Engine
        
        const profileForLedger = await UserService.getProfile(userId);
        const budget = await AiLedgerService.checkBudget(userId, profileForLedger);
        if (!budget.allowed) {
            throw new Error('BUDGET_EXHAUSTED');
        }

        const mapData = await ForecastEngine.generate(prompt);
        
        await AiLedgerService.recordUsage(userId, profileForLedger, {
            feature: 'time_map',
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            input_tokens: 1000,
            output_tokens: 1500
        });
        

        // 6. Save to Database (Cache for 1 year, or 12 months)
        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 1);

        const { data: savedMap, error } = await supabase
            .from('user_time_maps')
            .upsert({
                user_id: userId,
                language: language,
                annual_view: mapData.annual_view,
                quarters: mapData.quarters,
                months: mapData.months,
                valid_until: validUntil.toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, language' })
            .select('*')
            .single();

        if (error) {
            console.error("âŒ ForecastService DB Error:", error);
            throw new Error("Error al guardar el Mapa Temporal en los registros akáshicos.");
        }

        return savedMap;
    }
}


