import { useState, useEffect } from 'react';
import { MayanEngine } from '../lib/mayanEngine';
import { useCoherence } from './useCoherence';
import { getMoonPhase } from '../utils/lunar';

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
        kicheName?: string; // Add this for stronger typing if needed
    };
    fengShui?: {
        dailyStar: number;
        energy: string;
    };
}

export function useEnergy(userId?: string) {
    const [energy, setEnergy] = useState<EnergySnapshot | null>(null);
    const [loading, setLoading] = useState(true);

    // V4.0: Use Real Coherence Engine
    const { score, trend, astralMood } = useCoherence();

    useEffect(() => {
        const fetchEnergyData = async () => {
            setLoading(true);
            try {
                // 1. Local Calculation (Replaces /api/energy)
                const now = new Date();
                const todayIso = now.toISOString().split('T')[0];
                const day = now.getDate();

                // Transit Score (Replaced by Coherence Score conceptually, but we keep transitScore 
                // as a distinct "Environment" metric if needed, or sync it.
                // For "Energy Ring", the user wants the Coherence Score.
                // We will map transitScore to the Real Coherence Score for UI compatibility.
                const transitScore = score;

                // Dominant Element
                const elements = ['FUEGO', 'TIERRA', 'AIRE', 'AGUA'];
                const dominantElement = elements[day % 4];

                // Feng Shui / Guidance Logic (28 tips tied to Lunar Cycle age)
                const fengShuiTips = [
                    "Coloca una planta cerca de tu ventana para renovar el Qi.",
                    "Limpia tu escritorio para invitar a la claridad mental.",
                    "Añade un cristal de cuarzo en tu zona de trabajo.",
                    "Permite que la luz natural bañe tu espacio matutino.",
                    "Mantén el flujo de agua limpio para atraer prosperidad.",
                    "Elimina objetos rotos para evitar el estancamiento energético.",
                    "Enciende una vela de sándalo para purificar el ambiente.",
                    "Organiza tus libros para ordenar tus pensamientos.",
                    "Abre las cortinas al amanecer para recibir la frecuencia solar.",
                    "Despeja la entrada de tu casa para permitir que la abundancia fluya.",
                    "Coloca un espejo que refleje algo bello, nunca la puerta de entrada.",
                    "Usa incienso de ruda o copal para limpiar las esquinas de tu habitación.",
                    "Un tazón con agua y sal marina en tu mesa de noche absorbe estática astral.",
                    "Evita tener aparatos electrónicos encendidos cerca de tu cabeza al dormir.",
                    "Añade toques de color dorado en el rincón sur de tu espacio para la prosperidad.",
                    "El desorden debajo de la cama bloquea el descanso; mantén esa zona liberada.",
                    "Coloca una campanita de viento de metal en la zona oeste para disipar tensiones.",
                    "Un amuleto de ojo turco cerca de la puerta protege el umbral de tu templo.",
                    "Regala la ropa que no has usado en un año; libera espacio para lo nuevo.",
                    "Coloca una pirámide de amatista en tu centro para elevar la vibración.",
                    "Colores tierra en la cocina fomentan la nutrición y estabilidad.",
                    "Asegúrate de que tus puertas se abran por completo, sin chocar con objetos.",
                    "Un difusor con aceite de lavanda en la noche induce un descanso profundo.",
                    "El flujo de aire es vital; abre ventanas opuestas 10 minutos al día.",
                    "Coloca una esfera de cristal en ventanas soleadas para dispersar el arcoíris.",
                    "Mantén el asiento del inodoro abajo para evitar fugas de energía.",
                    "Escribe tu intención del día en un papel y colócalo bajo una vela.",
                    "Agradece a tu espacio físico por albergar tu cuerpo y alma cada mañana."
                ];
                
                const moon = getMoonPhase();
                // Safe lookup with modulo guard against missing age definition
                const dailyTip = fengShuiTips[(moon.age ?? 0) % fengShuiTips.length];
                const dailyStar = ((day + now.getMonth()) % 9) + 1;

                // Mayan Calculation
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
                    transitScore, // Now populated with Real Coherence Score
                    dominantElement,
                    guidance: dailyTip,
                    moonPhase: `${moon.name} ${moon.emoji}`,
                    mayan: mayanData,
                    fengShui: {
                        dailyStar,
                        energy: dailyStar % 2 === 0 ? 'YIN (Pasivo/Femenino)' : 'YANG (Activo/Masculino)'
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
    }, [userId, score, astralMood]); // Re-run when score or mood updates



    // Derived dynamic score (Safe clamp 0-100)
    // Now purely based on the Real Engine
    const baseScore = score;
    const dynamicScore = score;

    return {
        energy,
        dailyGuidance_short: energy?.guidance,
        baseScore,
        regulationBoost: 0, // Deprecated/Integrated into score
        dynamicScore,
        loading,
        trend, // Expose trend
        astralMood // Expose mood
    };
}
