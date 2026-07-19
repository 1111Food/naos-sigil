import { AstrologyEngine } from '../astrology/engine';
import { NumerologyService } from '../numerology/service';
import { MayanCalculator } from '../maya/calculator';
import { supabase } from '../../lib/supabase';

const NAHUALES = [
    "Imox", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluk", "Ok",
    "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ajaw"
];

export const NAHUAL_COMPATIBILITY: { [key: string]: string[] } = {
    Imox: ["Muluk", "Ok", "Eb"],
    Ik: ["Akbal", "Ben", "Ix"],
    Akbal: ["Ik", "Kan", "Cimi"],
    Kan: ["Akbal", "Chicchan", "Lamat"],
    Chicchan: ["Kan", "Cimi", "Manik"],
    Cimi: ["Akbal", "Chicchan", "Manik"],
    Manik: ["Chicchan", "Cimi", "Lamat"],
    Lamat: ["Kan", "Manik", "Muluk"],
    Muluk: ["Imox", "Lamat", "Ok"],
    Ok: ["Imox", "Muluk", "Chuen"],
    Chuen: ["Ok", "Eb", "Ben"],
    Eb: ["Imox", "Chuen", "Ben"],
    Ben: ["Ik", "Chuen", "Eb"],
    Ix: ["Ik", "Men", "Cib"],
    Men: ["Ix", "Cib", "Caban"],
    Cib: ["Ix", "Men", "Etznab"],
    Caban: ["Men", "Etznab", "Cauac"],
    Etznab: ["Cib", "Caban", "Cauac"],
    Cauac: ["Caban", "Etznab", "Ajaw"],
    Ajaw: ["Cauac", "Imox", "Ik"]
};

export class DailyOracleEngine {

    /**
     * Calculates the "Day Pillars" using high-fidelity engines.
     * This represents the "PULSO DE HOY" (Transit Data).
     */
    public static async getDayPillars(date: Date, lat: number = 14.6349, lng: number = -90.5069) {
        // We use UTC date string for caching global state
        const dateStr = date.toISOString().split('T')[0];

        // 1. Check Cache in daily_cosmic_states
        const { data: cachedState, error } = await supabase
            .from('daily_cosmic_states')
            .select('*')
            .eq('date_utc', dateStr)
            .maybeSingle();
            
        if (cachedState) {
            return {
                astrology: cachedState.astrology_data,
                numerology: cachedState.numerology_data,
                mayan: cachedState.mayan_data,
                chinese: cachedState.chinese_data
            };
        }

        // 2. Generate if not cached
        const transitChart = AstrologyEngine.calculateNatalChart(date, lat, lng);
        const sun = transitChart.planets.find(p => p.name === 'Sun');
        const moon = transitChart.planets.find(p => p.name === 'Moon');
        
        const universalNum = this.calculateUniversalDay(date);
        const mayan = this.calculateTzolkin(date);
        const chinese = { animal: this.getChineseAnimal(date.getUTCFullYear()) };

        const dayPillars = {
            astrology: {
                sunSign: sun?.sign || 'Unknown',
                moonSign: moon?.sign || 'Unknown',
                moonAbsDegree: moon?.absDegree || 0,
                transitElements: transitChart.elements
            },
            numerology: { universal: universalNum },
            mayan,
            chinese
        };

        // 3. Save to cache
        // Ignore errors if another process created it concurrently
        await supabase.from('daily_cosmic_states').insert({
            date_utc: dateStr,
            astrology_data: dayPillars.astrology,
            numerology_data: dayPillars.numerology,
            mayan_data: dayPillars.mayan,
            chinese_data: dayPillars.chinese
        });

        return dayPillars;
    }

    /**
     * Calculates the fusion between USER CORE and DAY ENERGY.
     * Generates Alignment, Friction, Opportunity, and Warning flags.
     */
    public static calculateFusion(userProfiles: any, dayPillars: any) {
        const { astrology_data: natalAstro, numerology_data: natalNum, maya_data: natalMaya } = userProfiles;
        
        let alignment = 0;
        let friction = 0;
        const flags: string[] = [];

        // --- 1. ASTRAL LAYERS (Sun, Moon, Asc, MC) ---
        if (natalAstro) {
            const transitSun = dayPillars.astrology.sunSign;
            const transitMoon = dayPillars.astrology.moonSign;

            // Sun-Sun Alignment
            if (natalAstro.sun?.sign === transitSun) {
                alignment += 0.3;
                flags.push('SOLAR_RESONANCE');
            }

            // Moon Stability
            if (natalAstro.moon?.sign === transitMoon) {
                alignment += 0.2;
                flags.push('EMOTIONAL_HARMONY');
            } else if (this.areSignsOpposite(natalAstro.moon?.sign, transitMoon)) {
                friction += 0.3;
                flags.push('EMOTIONAL_TENSION');
            }

            // Ascendant vs Transit
            if (natalAstro.ascendant?.sign === transitSun) {
                alignment += 0.25;
                flags.push('PRIMARY_ALIGNMENT');
            }
        }

        // --- 2. NUMERICAL LAYERS (Life Path, Personality, Pinnacle Keys) ---
        if (natalNum) {
            const universalDay = dayPillars.numerology.universal;
            const lifePath = natalNum.lifePathNumber;

            if (lifePath === universalDay) {
                alignment += 0.3;
                flags.push('ESSENCE_RESONANCE');
            }

            // Subconscious / Unconscious Keys
            const subconscious = natalNum.pinaculo?.i;
            const unconscious = natalNum.pinaculo?.j;

            if (subconscious === universalDay) {
                flags.push('SUBCONSCIOUS_TRIGGER');
                alignment += 0.15;
            }
            if (unconscious === universalDay) {
                flags.push('UNCONSCIOUS_CHALLENGE');
                friction += 0.2;
            }
        }

        // --- 3. MAYAN LAYERS (Nahual) ---
        if (natalMaya) {
            const natalNahual = natalMaya.nawal_maya || natalMaya.nawal;
            const dayNahual = dayPillars.mayan.nahual;

            if (natalNahual === dayNahual) {
                alignment += 0.4;
                flags.push('NAHUAL_SYNCHRO');
            } else if (NAHUAL_COMPATIBILITY[natalNahual]?.includes(dayNahual)) {
                alignment += 0.2;
                flags.push('MAYA_ALLIANCE');
            } else {
                friction += 0.2;
                flags.push('MAYA_RESISTANCE');
            }
        }

        // Normalize Scores
        const resonanceScore = Math.min(1, alignment);
        const frictionScore = Math.min(1, friction);
        const activationScore = Math.min(1, (alignment + friction) / 1.5);

        // Determine State
        let state: 'ALIGNMENT' | 'FRICTION' | 'OPPORTUNITY' | 'WARNING' = 'ALIGNMENT';
        if (frictionScore > 0.5) state = 'WARNING';
        else if (frictionScore > resonanceScore) state = 'FRICTION';
        else if (resonanceScore > 0.7) state = 'ALIGNMENT';
        else state = 'OPPORTUNITY';

        return {
            resonanceScore,
            frictionScore,
            activationScore,
            state,
            flags
        };
    }

    private static calculateUniversalDay(date: Date): number {
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        const sum = (n: number) => n.toString().split('').reduce((a, b) => a + Number(b), 0);
        let total = sum(day) + sum(month) + sum(year);
        while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
            total = sum(total);
        }
        return total;
    }

    private static areSignsOpposite(sign1: string, sign2: string): boolean {
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const i1 = signs.indexOf(sign1);
        const i2 = signs.indexOf(sign2);
        if (i1 === -1 || i2 === -1) return false;
        return Math.abs(i1 - i2) === 6;
    }

    public static calculateTzolkin(targetDate: Date) {
        const baseDate = new Date("2012-12-21T00:00:00Z");
        const d1 = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
        const d2 = Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate());
        const diffDays = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));

        let tone = (4 + diffDays) % 13;
        if (tone <= 0) tone += 13;

        let index = (19 + diffDays) % 20;
        if (index < 0) index += 20;

        return { tone, nahual: NAHUALES[index] };
    }

    public static getChineseAnimal(year: number): string {
        const chineseAnimals = ["Mono", "Gallo", "Perro", "Cerdo", "Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra"];
        return chineseAnimals[year % 12];
    }

    public static getAdaptiveProfile(scores: { resonanceScore: number, frictionScore: number, activationScore: number }, coherenceState: string) {
        let { resonanceScore, frictionScore, activationScore } = scores;
        let toneProfile: 'BALANCED' | 'CHALLENGE' | 'GUIDE' = 'BALANCED';

        if (coherenceState === 'HIGH') {
            activationScore = Math.min(1, activationScore + 0.15);
            frictionScore = Math.min(1, frictionScore * 1.2);
            toneProfile = 'CHALLENGE';
        } else if (coherenceState === 'LOW') {
            resonanceScore = Math.min(1, resonanceScore + 0.2);
            frictionScore = Math.max(0, frictionScore * 0.8);
            toneProfile = 'GUIDE';
        }

        return {
            adjustedScores: { resonanceScore, frictionScore, activationScore },
            toneProfile
        };
    }

    /**
     * Reusable method to get or generate a daily reading for a user.
     * Checks if it exists for the user's local day. If not, generates and caches it.
     */
    public static async getOrGenerateDailyReading(userId: string, userLocal: Date, offset: number, lang: 'es' | 'en') {
        const todayStr = userLocal.toISOString().split('T')[0];
        
        // 1. Calculate precise UTC bounds for the user's local day to avoid double generation
        const utcStartOfDay = new Date(new Date(`${todayStr}T00:00:00.000Z`).getTime() - (offset * 3600000)).toISOString();
        const utcEndOfDay = new Date(new Date(`${todayStr}T23:59:59.999Z`).getTime() - (offset * 3600000)).toISOString();
        
        // 2. Check Cache
        const { data: cached } = await supabase
            .from('daily_readings')
            .select('reading_data, reading_text, is_read, energy_score')
            .eq('user_id', userId)
            .gte('created_at', utcStartOfDay)
            .lte('created_at', utcEndOfDay)
            .maybeSingle();

        if (cached && cached.reading_data) {
            return cached.reading_data;
        }

        // 3. Generate 12-Factor Oracle
        const { data: fullProfile } = await supabase
            .from('profiles')
            .select('astrology, numerology, mayan, chinese_animal, chinese_element, nickname, full_name')
            .eq('id', userId)
            .single();

        if (!fullProfile) throw new Error("Profile not found");

        const profileForEngine = {
            astrology_data: fullProfile?.astrology,
            numerology_data: fullProfile?.numerology,
            maya_data: fullProfile?.mayan,
            china_data: { animal: fullProfile?.chinese_animal, element: fullProfile?.chinese_element }
        };

        const dayPillars = await this.getDayPillars(userLocal);
        const interaction = this.calculateFusion(profileForEngine, dayPillars);
        
        // Fetch Coherence (using dynamic import or mock if service is not imported, but CoherenceService should be available)
        // Since we didn't import CoherenceService here to avoid circular dependencies, we can fetch directly:
        const { data: coherenceData } = await supabase
            .from('coherence_metrics')
            .select('global_coherence')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
        const gc = coherenceData?.global_coherence || 50;
        const coherence = {
            state: gc >= 75 ? 'HIGH' : gc < 45 ? 'LOW' : 'MEDIUM',
            level: gc / 100
        };
        const { toneProfile } = this.getAdaptiveProfile(interaction, coherence.state);

        // This requires importing DailyOracleOracle
        // We will import it at the top of the file.
        const { DailyOracleOracle } = require('./DailyOracleOracle');

        const readingData = await DailyOracleOracle.generateDailyReading({
            userName: fullProfile.nickname || fullProfile.full_name,
            userPillars: profileForEngine, // Passed in the right format
            dayPillars,
            interaction,
            coherence,
            toneProfile,
            language: lang
        });

        // Cache Result
        await supabase.from('daily_readings').insert({
            user_id: userId,
            reading_text: readingData.texto_principal, // Fallback for old clients
            reading_data: readingData,
            energy_score: readingData.score_energia_general,
            pillars_data: { dayPillars, interaction }
        });

        return readingData;
    }
}
