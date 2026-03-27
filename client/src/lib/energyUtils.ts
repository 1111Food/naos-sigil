export interface DailyInsight {
    mode: 'EXPANSION' | 'REFUGE' | 'PORTAL' | 'BALANCE';
    titleKey: string;
    adviceKey: string;
    keywords: string[];
    color: string;
}

export function generateDailyInsight(
    zodiacSign: string | undefined,
    personalNumber: number,
    universalDayNumber: number
): DailyInsight {

    // 1. Determine Elemental Nature of the Sign
    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

    let element = 'Unknown';
    if (fireSigns.includes(zodiacSign || '')) element = 'FIRE';
    else if (airSigns.includes(zodiacSign || '')) element = 'AIR';
    else if (earthSigns.includes(zodiacSign || '')) element = 'EARTH';
    else if (waterSigns.includes(zodiacSign || '')) element = 'WATER';

    // 2. Determine Number Nature
    const activeNumbers = [1, 3, 5, 8];
    const passiveNumbers = [2, 4, 6, 7, 9];
    const masterNumbers = [11, 22, 33];

    // 3. Cross-Reference Logic

    // PRIORITY: MASTER NUMBERS (Portal)
    if (masterNumbers.includes(universalDayNumber) || masterNumbers.includes(personalNumber)) {
        return {
            mode: 'PORTAL',
            titleKey: 'energy_portal_title',
            adviceKey: 'energy_portal_advice',
            keywords: ['Intuición', 'Maestría', 'Sincronicidad'],
            color: 'text-violet-300'
        };
    }

    // MATCH: EXPANSION (Active Element + Active Number)
    if ((element === 'FIRE' || element === 'AIR') && activeNumbers.includes(personalNumber)) {
        return {
            mode: 'EXPANSION',
            titleKey: 'energy_expansion_title',
            adviceKey: 'energy_expansion_advice',
            keywords: ['Liderazgo', 'Socializar', 'Iniciar'],
            color: 'text-amber-300'
        };
    }

    // MATCH: REFUGE (Passive Element + Passive Number)
    if ((element === 'WATER' || element === 'EARTH') && passiveNumbers.includes(personalNumber)) {
        return {
            mode: 'REFUGE',
            titleKey: 'energy_refuge_title',
            adviceKey: 'energy_refuge_advice',
            keywords: ['Hogar', 'Calma', 'Nutrición'],
            color: 'text-emerald-300'
        };
    }

    // MIXED/BALANCE (Active Element + Passive Number OR Passive Element + Active Number)
    return {
        mode: 'BALANCE',
        titleKey: 'energy_balance_title',
        adviceKey: 'energy_balance_advice',
        keywords: ['Integración', 'Paciencia', 'Estrategia'],
        color: 'text-rose-300'
    };
}
