import { supabase } from '../../lib/supabase';
import { UserService } from '../user/service';
import { ForecastCalculator } from './calculator';
import { ForecastContextInjector } from './contextInjector';
import { ForecastPromptBuilder } from './promptBuilder';
import { ForecastEngine } from './engine';

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

        return data;
    }

    static async generateTimeMap(userId: string, language: string = 'es') {
        console.log(`🌀 ForecastService: Generating Time Map for user ${userId} [${language}]`);
        
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

        // 4. Build Mega-Prompt
        const prompt = ForecastPromptBuilder.build(profile, behaviorContext, cycles, pinnacles, language);

        // 5. Execute AI Engine
        const mapData = await ForecastEngine.generate(prompt);

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
            console.error("❌ ForecastService DB Error:", error);
            throw new Error("Error al guardar el Mapa Temporal en los registros akáshicos.");
        }

        return savedMap;
    }
}
