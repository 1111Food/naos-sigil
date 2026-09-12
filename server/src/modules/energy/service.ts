import { EnergySnapshot, UserProfile } from '../../types';
import { MayanCalculator } from '../../utils/mayaCalculator';
import { AstrologyService } from '../astrology/astroService';
import { supabase } from '../../lib/supabase';
import { EnergyEngine } from './engine';
import { RequestDeduplicator } from '../../lib/deduplicator';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const ASTRO_CONTEXT_VERSION = 2;

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

    /**
     * GET /api/energy/current — L1 (RAM) → L2 (Supabase V2) → Gemini → UPSERT → RAM → response
     */
    static async getCurrentEnergy(userId: string, lang: string = 'es') {
        // ── 1. Fetch profile first to get CURRENT timezone (not birth timezone) ──
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            throw new Error('Profile not found');
        }

        // ── 2. Derive localToday from CURRENT timezone
        //       profile.astrology.timezone_offset = current device timezone
        //       profile_data.utcOffset             = BIRTH timezone (must NOT be used here)
        const currentTzOffset: number = profile.astrology?.timezone_offset ?? 0;
        const now = new Date();
        const localTime = now.getTime() + (currentTzOffset * 60 * 60 * 1000);
        const localToday = new Date(localTime).toISOString().split('T')[0];

        // ── 3. Strict lang validation — prevents cache key pollution ──
        const safeLang = ['es', 'en'].includes(lang) ? lang : 'es';

        const cacheKey = `${userId}_${localToday}_${safeLang}`;

        // ── 4. L1 RAM cache hit ──
        if (energyCache.has(cacheKey)) {
            console.log(`⚡ [ENERGY] L1 RAM hit | user=${userId} | date=${localToday} | lang=${safeLang}`);
            return energyCache.get(cacheKey);
        }

        // ── 5. L2 Supabase persistent cache — only V2 snapshots are valid ──
        const { data: snapshot, error: snapshotError } = await supabase
            .from('user_energy_snapshots')
            .select('payload')
            .eq('user_id', userId)
            .eq('snapshot_date', localToday)
            .eq('language', safeLang)
            .maybeSingle();

        if (snapshotError) {
            // Real DB error — must NOT be silently treated as cache miss
            console.error(`🔴 [ENERGY] Supabase read error | user=${userId} | date=${localToday}`, snapshotError.message);
            throw new Error('Energy service temporarily unavailable');
        }

        if (snapshot?.payload && snapshot.payload.astro_context_version === ASTRO_CONTEXT_VERSION) {
            console.log(`💾 [ENERGY] L2 Supabase hit (V${ASTRO_CONTEXT_VERSION}) | user=${userId} | date=${localToday} | lang=${safeLang} | Gemini=0`);
            // Promote to L1 for this session
            energyCache.set(cacheKey, snapshot.payload);
            if (energyCache.size > 1000) {
                const firstKey = energyCache.keys().next().value;
                if (firstKey) energyCache.delete(firstKey);
            }
            return snapshot.payload;
        }

        if (snapshot?.payload) {
            console.log(`🔄 [ENERGY] Outdated snapshot (not V${ASTRO_CONTEXT_VERSION}) → regenerating | user=${userId}`);
        } else {
            console.log(`🔮 [ENERGY] Cache MISS → calling Gemini | user=${userId} | date=${localToday} | lang=${safeLang} | Gemini=1`);
        }

        // ── 6. Generate with Gemini (deduplicated to prevent concurrent duplicate calls) ──
        const dedupKey = `energy_gen_${userId}_${localToday}_${safeLang}`;
        const rawEnergyData = await RequestDeduplicator.execute(dedupKey, () =>
            EnergyEngine.generate({
                profile,
                currentDate: localToday,
                lang: safeLang
            })
        );

        // ── 7. Stamp astro_context_version before persisting ──
        const energyData = {
            ...rawEnergyData,
            astro_context_version: ASTRO_CONTEXT_VERSION
        };

        // ── 8. UPSERT to L2 Supabase (constraint: user_id + snapshot_date + language) ──
        const { error: upsertError } = await supabase
            .from('user_energy_snapshots')
            .upsert({
                user_id: userId,
                snapshot_date: localToday,
                language: safeLang,
                payload: energyData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, snapshot_date, language' });

        if (upsertError) {
            // Gemini succeeded — log sanitized warning, do NOT expose Supabase details to client
            // Do NOT claim persistence succeeded
            console.warn(`⚠️ [ENERGY] UPSERT failed — Gemini result NOT persisted | user=${userId} | date=${localToday}`, upsertError.message);
        } else {
            console.log(`✅ [ENERGY] UPSERT success | user=${userId} | date=${localToday} | lang=${safeLang}`);
        }

        // ── 9. Promote to L1 RAM regardless of UPSERT result ──
        energyCache.set(cacheKey, energyData);
        if (energyCache.size > 1000) {
            const firstKey = energyCache.keys().next().value;
            if (firstKey) energyCache.delete(firstKey);
        }

        return energyData;
    }
}
