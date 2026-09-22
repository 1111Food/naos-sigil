
// server/src/modules/user/service.ts
import path from 'path';
import { promises as fs } from 'node:fs';
import { UserProfile } from '../../types';
import { AstrologyService } from '../astrology/astroService';
import { GeocodingService } from './geocoding';
import { NumerologyService } from '../numerology/service';
import { FengShuiService } from '../astrology/fengshui';
import { config } from '../../config/env';
import { MayanCalculator } from '../../utils/mayaCalculator';
import { ChineseAstrology } from '../../utils/chineseAstrology';
import { supabase } from '../../lib/supabase';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { ArchetypeEngine } from './archetypeEngine';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

export class UserService {
    private static profilesCache: Record<string, UserProfile> = {};

    private static async ensureDataDir() {
        if (process.env.NODE_ENV === 'production') return;
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
        } catch (e) { }
    }

    private static async loadProfiles() {
        if (process.env.NODE_ENV === 'production') return;
        await this.ensureDataDir();
        try {
            const content = await fs.readFile(PROFILES_FILE, 'utf-8');
            this.profilesCache = JSON.parse(content);
        } catch (e) {
            this.profilesCache = {};
        }
    }

    private static async saveProfiles() {
        if (process.env.NODE_ENV === 'production') return;
        await this.ensureDataDir();
        try {
            await fs.writeFile(PROFILES_FILE, JSON.stringify(this.profilesCache, null, 2));
        } catch (e) {}
    }

    static async getProfile(userId: string): Promise<UserProfile> {
        if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
            userId = '00000000-0000-0000-0000-000000000000';
        }

        // 1. Try Supabase first
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, onboarding_completed')
                .eq('id', userId)
                .maybeSingle();

            if (data && !error) {
                const baseProfile = (data.profile_data || {}) as Partial<UserProfile>;
                
                // ðŸ“Š DOPAMINE ENGINE: Consciousness Points
                let meditationCount = 0;
                try {
                    const { count } = await supabase
                        .from('meditation_sessions')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', userId);
                    meditationCount = count || 0;
                } catch (e) {
                    console.error("Consciousness points count failed:", e);
                }

                const score = meditationCount * 10; // 10 pts per session
                let level = 'Iniciado';
                if (score >= 1000) level = 'Arquitecto';
                else if (score >= 500) level = 'Maestro';
                else if (score >= 200) level = 'Practicante';
                else if (score >= 50) level = 'Adepto';

                // --- MULTI-PROFILE LAUNCH FREEZE ---
                // Enforcing Owner as the only effective profile to prevent context leakage.
                let activeSub: any = null;
                // if (baseProfile.sub_profiles && baseProfile.active_sub_profile_id) {
                //     activeSub = baseProfile.sub_profiles.find(p => p.id === baseProfile.active_sub_profile_id);
                // }

                // ðŸ”‘ CRITICAL FIX: Derive subscription from the authoritative plan_type SQL column.
                // The Stripe webhook writes plan_type. We must reflect that here, NOT rely on
                // the stale JSONB 'subscription' field which is never updated by the webhook.
                const planType = data.plan_type || baseProfile.plan_type || 'free';
                const isPremiumPlan = planType === 'premium' || planType === 'premium_plus' || planType === 'admin';
                const derivedSubscription: any = isPremiumPlan
                    ? {
                        plan: planType === 'admin' ? 'EXTENDED' : 'PREMIUM',
                        validUntil: data.subscription_expires_at || new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
                        features: ['basic_chat', 'daily_energy', 'tarot_spreads', 'full_chart', 'deep_interpretation', 'synastry', 'lab', 'protocols']
                    }
                    : (baseProfile.subscription || { plan: 'FREE', features: ['basic_chat'] });

                const resolvedAstrology = activeSub?.astrology || data.astrology || data.natal_chart || baseProfile.astrology || undefined;
                const resolvedNumerology = activeSub?.numerology || data.numerology || baseProfile.numerology || undefined;
                const resolvedMayan = activeSub?.mayan || data.mayan || baseProfile.mayan || undefined;
                const resolvedChinese = {
                     animal: activeSub?.chinese_animal || data.chinese_animal || baseProfile.chinese_animal,
                     element: activeSub?.chinese_element || data.chinese_element || baseProfile.chinese_element,
                     birthYear: activeSub?.chinese_birth_year || data.chinese_birth_year || baseProfile.chinese_birth_year
                };

                let canonicalArchetype = undefined;
                if (resolvedAstrology && resolvedNumerology && resolvedMayan) {
                     canonicalArchetype = ArchetypeEngine.calculate({
                         astrology: resolvedAstrology,
                         numerology: resolvedNumerology,
                         mayan: resolvedMayan,
                         chinese: resolvedChinese
                     });
                }
                
                let identityCode = data.naos_identity_code || baseProfile.naos_identity_code || undefined;
                if (canonicalArchetype && identityCode) {
                    const storedArchetypeId = (identityCode as any)?.arquetipo?.id;
                    if (!storedArchetypeId || canonicalArchetype.id !== storedArchetypeId) {
                        console.warn(`[ARCHETYPE_ENGINE] Canonical override: Discarding stale identity code (Stored: ${storedArchetypeId || 'MISSING_ID'} vs Canonical: ${canonicalArchetype.id})`);
                        identityCode = undefined;
                        
                        try {
                            const clearedBase = { ...baseProfile, naos_identity_code: null };
                            supabaseAdmin.from('profiles').update({
                                naos_identity_code: null,
                                profile_data: clearedBase 
                            }).eq('id', userId).then((res) => {
                                if (res.error) console.error('[ARCHETYPE_ENGINE] DB Wipe error:', res.error);
                            });
                        } catch(e) {
                            console.error('Failed to invalidate stale identity code in DB:', e);
                        }
                    }
                }

                const dbProfile: UserProfile = {
                    ...baseProfile,
                    id: data.id,
                    canonical_archetype: canonicalArchetype as any,
                    name: activeSub?.name || data.full_name || data.name || baseProfile.name || 'Viajero cosmico',
                    guardian_notes: data.guardian_notes || baseProfile.guardian_notes || undefined,
                    birthDate: activeSub?.birthDate || data.birth_date || baseProfile.birthDate || '',
                    birthTime: activeSub?.birthTime || data.birth_time || baseProfile.birthTime || '',
                    birthCity: activeSub?.birthCity || data.birth_location || baseProfile.birthCity || '',
                    astrology: activeSub?.astrology || data.astrology || data.natal_chart || baseProfile.astrology || undefined,
                    numerology: resolvedNumerology,
                    mayan: resolvedMayan,
                    nawal_maya: activeSub?.nawal_maya || baseProfile.nawal_maya || undefined,
                    chinese_animal: resolvedChinese.animal || undefined,
                    chinese_element: resolvedChinese.element || undefined,
                    chinese_birth_year: resolvedChinese.birthYear || undefined,
                    sigil_url: activeSub?.sigil_url || baseProfile.sigil_url || undefined,
                    coordinates: activeSub?.coordinates || baseProfile.coordinates || { lat: 14.6349, lng: -90.5069 },
                    utcOffset: activeSub?.utcOffset !== undefined ? activeSub.utcOffset : (baseProfile.utcOffset !== undefined ? baseProfile.utcOffset : -6),
                    birthPlace: activeSub?.birthPlace || baseProfile.birthPlace || '',
                    birthState: activeSub?.birthState || baseProfile.birthState || '',
                    birthCountry: activeSub?.birthCountry || baseProfile.birthCountry || 'Guatemala',
                    subscription: derivedSubscription,
                    plan_type: planType,
                    usage_level: data.usage_level || baseProfile.usage_level || 'normal',
                    daily_interactions: data.daily_interactions || baseProfile.daily_interactions || 0,
                    onboarding_completed: data.onboarding_completed || baseProfile.onboarding_completed || false,
                    naos_identity_code: identityCode,
                    active_sub_profile_id: baseProfile.active_sub_profile_id,
                    sub_profiles: baseProfile.sub_profiles,
                    consciousness_level: level,
                    consciousness_points: score
                };
                (dbProfile as any).system_role = data.system_role || 'user';
                this.profilesCache[userId] = dbProfile;
                return dbProfile;
            }
        } catch (e) {
            console.error("Supabase Profile Fetch Failed:", e);
        }

        // 2. Fallback to Local Cache/File
        if (Object.keys(this.profilesCache).length === 0) {
            await this.loadProfiles();
        }
        
        if (this.profilesCache[userId]) {
            return this.profilesCache[userId];
        }

        // 3. Final Default
        const defaultProfile: UserProfile = {
            id: userId,
            name: 'Viajero en el Umbral',
            birthDate: '',
            birthTime: '',
            birthPlace: 'Tierra',
            birthCity: '',
            birthState: '',
            birthCountry: '',
            coordinates: { lat: 14.6349, lng: -90.5069 },
            subscription: { plan: 'FREE', features: ['basic_chat'] },
            plan_type: 'free',
            usage_level: 'normal',
            daily_interactions: 0,
            onboarding_completed: false
        };
        this.profilesCache[userId] = defaultProfile;
        return defaultProfile;
    }

    static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
        let baseProfile: any = {};
        let dbRow: any = null;
        try {
            const { data: row } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
            if (row) {
                dbRow = row;
                baseProfile = row.profile_data || {};
            }
        } catch (e) { }

        let current = await this.getProfile(userId); // still needed for returning merged state at end
        
        // SEC-005 FIX: Mass Assignment Prevention
        // ONLY extract fields that the frontend is explicitly allowed to modify.
        const d = data as any;
        const allowedUpdates: any = {
            name: d.name,
            full_name: d.name || d.full_name,
            birthDate: d.birthDate,
            birthTime: d.birthTime,
            birthCity: d.birthCity,
            birthState: d.birthState,
            birthCountry: d.birthCountry,
            coordinates: d.coordinates,
            language: d.language,
            push_subscriptions: d.push_subscriptions,
            telegram_voice_enabled: d.telegram_voice_enabled
        };

        // SEC-006 FIX: Narrow Timezone Update (No arbitrary canonical object writes)
        if (d.astrology?.timezone_offset !== undefined) {
            allowedUpdates.astrology = {
                ...(current.astrology || {}),
                timezone_offset: d.astrology.timezone_offset
            };
        }

        if (d.profile_data?.timezone_iana !== undefined) {
            allowedUpdates.profile_data = {
                ...((current as any).profile_data || {}),
                timezone_iana: d.profile_data.timezone_iana
            };
        }

        // Remove undefined fields
        Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

        let updated = { ...baseProfile, ...allowedUpdates }; // operates on raw to save correctly below

        // Birth Data & Geography LOCK
        const birthDataChanged = 
            (data.birthDate && data.birthDate !== current.birthDate) ||
            (data.birthTime && data.birthTime !== current.birthTime) ||
            (data.birthCity && data.birthCity !== current.birthCity) ||
            (data.birthCountry && data.birthCountry !== current.birthCountry) ||
            (data.coordinates?.lat && data.coordinates.lat !== current.coordinates?.lat) ||
            (data.coordinates?.lng && data.coordinates.lng !== current.coordinates?.lng);

        if (birthDataChanged) {
            try {
                const locationChanged = (data.birthCity && data.birthCity !== current.birthCity) ||
                                        (data.birthCountry && data.birthCountry !== current.birthCountry);
                
                if (locationChanged || !updated.coordinates?.lat) {
                    const coords = await GeocodingService.getCoordinates(updated.birthCity, updated.birthState || '', updated.birthCountry);
                    updated.coordinates = { lat: coords.lat, lng: coords.lng };
                }

                const tzId = GeocodingService.getTimezoneId(updated.coordinates.lat, updated.coordinates.lng);
                updated.utcOffset = GeocodingService.getHistoricalUtcOffset(tzId, updated.birthDate || current.birthDate, updated.birthTime || current.birthTime);
            } catch (e) {
                if (!updated.coordinates?.lat) {
                    updated.coordinates = { lat: 14.6349, lng: -90.5069 };
                }
                updated.utcOffset = -6;
            }
        }

        // Canonical identity signals are calculated server-side.
        // Client input is limited to birth/name/location facts only.
        const nameChanged =
            !!data.name && data.name !== current.name;

        const canonicalSignalsMissing =
            !current.numerology ||
            !current.mayan ||
            !current.chinese_animal ||
            !current.chinese_element ||
            !current.astrology;

        if ((birthDataChanged || nameChanged || canonicalSignalsMissing) && updated.birthDate) {
            // Date-based systems do not require birth time.
            const numerology = NumerologyService.calculateProfile(
                updated.birthDate,
                updated.name || current.name || 'Viajero'
            );

            const mayan = MayanCalculator.calculate(updated.birthDate);
            const chinese = ChineseAstrology.calculate(updated.birthDate);

            updated.numerology = numerology;
            updated.mayan = mayan;
            updated.nawal_maya = `${mayan.tone} ${mayan.kicheName}`;
            updated.chinese_animal = chinese.animal;
            updated.chinese_element = chinese.element;
            updated.chinese_birth_year = chinese.birthYear;

            // Astrology requires a real birth time. Never fabricate noon here.
            if (
                updated.birthTime &&
                updated.coordinates?.lat !== undefined &&
                updated.coordinates?.lng !== undefined &&
                updated.utcOffset !== undefined
            ) {
                updated.astrology = await AstrologyService.calculateProfile(
                    updated.birthDate,
                    updated.birthTime,
                    updated.coordinates.lat,
                    updated.coordinates.lng,
                    updated.utcOffset
                );
            }
        }

        // Sync local cache
        this.profilesCache[userId] = { ...current, ...updated };
        await this.saveProfiles();

        // Supabase Sync
        if (config.SUPABASE_URL) {
            const payload = {
                id: userId,
                name: updated.name || current.name,
                full_name: updated.full_name || updated.name || current.name,
                birth_date: updated.birthDate || current.birthDate,
                birth_time: updated.birthTime || current.birthTime,
                birth_location: updated.birthCity || current.birthCity,
                plan_type: updated.plan_type || current.plan_type,
                onboarding_completed: updated.onboarding_completed !== undefined ? updated.onboarding_completed : current.onboarding_completed,
                oracle_time: updated.oracle_time || current.oracle_time,
                profile_data: updated,
                updated_at: new Date().toISOString()
            };
            const { error: upsertError } = await supabaseAdmin.from('profiles').upsert(payload);
            if (upsertError) throw upsertError;
        }

        return await this.getProfile(userId);
    }

    static async markOnboardingCompleted(userId: string): Promise<UserProfile> {
        let current = await this.getProfile(userId);
        
        if (config.SUPABASE_URL) {
            const { error: onboardingError } = await supabaseAdmin
                .from('profiles')
                .update({ onboarding_completed: true })
                .eq('id', userId);
            if (onboardingError) throw onboardingError;
        }
        
        const updated = { ...current, onboarding_completed: true };
        this.profilesCache[userId] = updated;
        await this.saveProfiles();
        
        return updated;
    }

    static async addSubProfile(userId: string, data: any): Promise<UserProfile> {
        const current = await this.getProfile(userId);
        const subProfiles = current.sub_profiles || [];

        const maxSubProfiles = current.plan_type === 'premium' || current.plan_type === 'premium_plus' || current.plan_type === 'admin' ? 3 : 0;
        if (subProfiles.length >= maxSubProfiles) {
            throw new Error(`Profile limit reached for plan ${current.plan_type}.`);
        }

        const newSub = {
            id: Math.random().toString(36).substring(2, 9),
            ...data
        };

        const updatedSubs = [...subProfiles, newSub];
        return await this.updateProfile(userId, { sub_profiles: updatedSubs });
    }

    static async editSubProfile(userId: string, subId: string, data: any): Promise<UserProfile> {
        const current = await this.getProfile(userId);
        const subProfiles = current.sub_profiles || [];

        const updatedSubs = subProfiles.map(p => p.id === subId ? { ...p, ...data } : p);
        return await this.updateProfile(userId, { sub_profiles: updatedSubs });
    }

    static async deleteSubProfile(userId: string, subId: string): Promise<UserProfile> {
        const current = await this.getProfile(userId);
        const subProfiles = current.sub_profiles || [];

        const updatedSubs = subProfiles.filter(p => p.id !== subId);
        const payload: Partial<UserProfile> = { sub_profiles: updatedSubs };
        if (current.active_sub_profile_id === subId) {
            payload.active_sub_profile_id = undefined;
        }
        return await this.updateProfile(userId, payload);
    }

    static async switchProfile(userId: string, subId: string | undefined): Promise<UserProfile> {
        // subId === undefined means switch to Master Profile
        return await this.updateProfile(userId, { active_sub_profile_id: subId });
    }
}


