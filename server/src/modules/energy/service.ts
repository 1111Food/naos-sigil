import { EnergySnapshot, UserProfile } from '../../types';
import { MayanCalculator } from '../../utils/mayaCalculator';
import { AstrologyService } from '../astrology/astroService';
import { supabase } from '../../lib/supabase';
import { EnergyEngine } from './engine';

// In-memory cache to save API limits. 
// Key: {userId}_{YYYY-MM-DD}_{lang}
const energyCache = new Map<string, any>();

export class EnergyService {
    static getDailySnapshot(user: any, coherenceScore: number = 50, date: Date = new Date()): EnergySnapshot {
        const hour = date.getHours();
        const dayNightMode = (hour >= 6 && hour < 18) ? 'DAY' : 'NIGHT';

        // REAL COHERENCE INTEGRATION
        const mood = AstrologyService.getDailyMood(date);
        const moodModifier = mood === 'HARMONIOUS' ? 10 : mood === 'CHALLENGING' ? -10 : 0;
        const transitScore = Math.max(0, Math.min(100, coherenceScore + moodModifier));

        const elementsMap: Record<string, string> = {
            'FIRE': 'FUEGO',
            'EARTH': 'TIERRA',
            'AIR': 'AIRE',
            'WATER': 'AGUA'
        };
        const elementsValues: ('FIRE' | 'EARTH' | 'AIR' | 'WATER')[] = ['FIRE', 'EARTH', 'AIR', 'WATER'];
        const elementIndex = date.getDate() % 4;
        const dominantElementRaw = elementsValues[elementIndex];
        const dominantElement = elementsMap[dominantElementRaw];

        const fengShuiTips = [
            "Coloca una planta cerca de tu ventana para renovar el Qi.",
            "Limpia tu escritorio para invitar a la claridad mental.",
            "Añade un cristal de cuarzo en tu zona de trabajo.",
            "Permite que la luz natural bañe tu espacio matutino."
        ];
        const dailyTip = fengShuiTips[date.getDate() % fengShuiTips.length];

        const dateStr = date.toISOString().split('T')[0];
        const mayanDaily = MayanCalculator.calculate(dateStr);
        const dailyStar = ((date.getDate() + date.getMonth()) % 9) + 1;

        return {
            date: dateStr,
            transitScore,
            dominantElement,
            guidance: dailyTip,
            moonPhase: 'Luna Creciente 🌙',
            mayan: {
                nawal: mayanDaily.kicheName,
                tone: mayanDaily.tone,
                meaning: mayanDaily.meaning
            } as any,
            fengShui: {
                dailyStar,
                energy: dailyStar % 2 === 0 ? 'YIN (Pasivo/Femenino)' : 'YANG (Activo/Masculino)'
            }
        } as EnergySnapshot;
    }

    static async getCurrentEnergy(userId: string, lang: string = 'es') {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `${userId}_${today}_${lang}`;

        if (energyCache.has(cacheKey)) {
            console.log(`⚡ EnergyService: Returning cached energy for ${userId}`);
            return energyCache.get(cacheKey);
        }

        console.log(`🌀 EnergyService: Generating new energy for ${userId}`);
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            throw new Error('Profile not found');
        }

        const energyData = await EnergyEngine.generate({
            profile,
            currentDate: today,
            lang
        });

        energyCache.set(cacheKey, energyData);
        
        if (energyCache.size > 1000) {
            const firstKey = energyCache.keys().next().value;
            if (firstKey) energyCache.delete(firstKey);
        }

        return energyData;
    }
}
