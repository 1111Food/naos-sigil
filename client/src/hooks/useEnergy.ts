import { useState, useEffect } from 'react';
import { MayanEngine } from '../lib/mayanEngine';
import { useCoherence } from './useCoherence';
import { getMoonPhase } from '../utils/lunar';
import { useTranslation } from '../i18n';

// Types
interface EnergySnapshot {
    date: string;
    transitScore: number;
    dominantElement: string;
    guidance: string;
    moonPhase: string;
    mayan?: {
        nawal: string;
        tone: number;
        meaning: string;
        kicheName?: string;
    };
    fengShui?: {
        dailyStar: number;
        energy: string;
    };
}

export function useEnergy(userId?: string) {
    const { t } = useTranslation();
    const [energy, setEnergy] = useState<EnergySnapshot | null>(null);
    const [loading, setLoading] = useState(true);

    const { score, trend, astralMood } = useCoherence();

    useEffect(() => {
        const fetchEnergyData = async () => {
            setLoading(true);
            try {
                const now = new Date();
                const todayIso = now.toISOString().split('T')[0];
                const day = now.getDate();

                const transitScore = score;

                const elements = [
                    t('energy_element_fire'),
                    t('energy_element_earth'),
                    t('energy_element_air'),
                    t('energy_element_water')
                ];
                const dominantElement = elements[day % 4];

                const moon = getMoonPhase();
                const tipIndex = (moon.age ?? 0) % 28;
                const dailyTip = t(`tip_${tipIndex}` as any);
                const dailyStar = ((day + now.getMonth()) % 9) + 1;

                let mayanData;
                try {
                    const m = MayanEngine.calculate(todayIso);
                    mayanData = {
                        nawal: m.nawal_maya,
                        tone: m.nawal_tono,
                        meaning: m.meaning,
                        kicheName: m.kicheName
                    };
                } catch (e) {
                    console.warn("Mayan calc error:", e);
                }

                const baseData: EnergySnapshot = {
                    date: todayIso,
                    transitScore,
                    dominantElement,
                    guidance: dailyTip,
                    moonPhase: `${moon.name} ${moon.emoji}`,
                    mayan: mayanData,
                    fengShui: {
                        dailyStar,
                        energy: dailyStar % 2 === 0 ? t('energy_yin') : t('energy_yang')
                    }
                };

                setEnergy(baseData);
            } catch (err) {
                console.error("Local energy calculation failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEnergyData();
    }, [userId, score, astralMood, t]);

    const baseScore = score;
    const dynamicScore = score;

    return {
        energy,
        dailyGuidance_short: energy?.guidance,
        baseScore,
        regulationBoost: 0,
        dynamicScore,
        loading,
        trend,
        astralMood
    };
}
