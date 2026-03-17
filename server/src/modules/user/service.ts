
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
                const dbProfile: UserProfile = {
                    ...baseProfile,
                    id: data.id,
                    name: data.full_name || data.name || baseProfile.name || 'Viajero cosmico',
                    guardian_notes: data.guardian_notes || baseProfile.guardian_notes || undefined,
                    birthDate: data.birth_date || baseProfile.birthDate || '',
                    birthTime: data.birth_time || baseProfile.birthTime || '',
                    birthCity: data.birth_location || baseProfile.birthCity || '',
                    astrology: data.astrology || data.natal_chart || baseProfile.astrology || undefined,
                    numerology: data.numerology || baseProfile.numerology || undefined,
                    mayan: data.mayan || baseProfile.mayan || undefined,
                    nawal_maya: data.nawal_maya || baseProfile.nawal_maya || undefined,
                    chinese_animal: data.chinese_animal || baseProfile.chinese_animal || undefined,
                    chinese_element: data.chinese_element || baseProfile.chinese_element || undefined,
                    chinese_birth_year: data.chinese_birth_year || baseProfile.chinese_birth_year || undefined,
                    sigil_url: data.sigil_url || baseProfile.sigil_url || undefined,
                    coordinates: baseProfile.coordinates || { lat: 14.6349, lng: -90.5069 },
                    utcOffset: baseProfile.utcOffset !== undefined ? baseProfile.utcOffset : -6,
                    birthPlace: baseProfile.birthPlace || '',
                    birthState: baseProfile.birthState || '',
                    birthCountry: baseProfile.birthCountry || 'Guatemala',
                    subscription: baseProfile.subscription || { plan: 'FREE', features: [] },
                    plan_type: data.plan_type || baseProfile.plan_type || 'free',
                    usage_level: data.usage_level || baseProfile.usage_level || 'normal',
                    daily_interactions: data.daily_interactions || baseProfile.daily_interactions || 0,
                    onboarding_completed: data.onboarding_completed || baseProfile.onboarding_completed || false
                };
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
        let current = await this.getProfile(userId);
        let updated = { ...current, ...data };

        // Geography LOCK
        const locationChanged = (data.birthCity && data.birthCity !== current.birthCity) ||
                              (data.birthCountry && data.birthCountry !== current.birthCountry);

        if (locationChanged) {
            try {
                const coords = await GeocodingService.getCoordinates(updated.birthCity, updated.birthState || '', updated.birthCountry);
                updated.coordinates = { lat: coords.lat, lng: coords.lng };
                updated.utcOffset = await GeocodingService.getTimezoneOffset(coords.lat, coords.lng);
            } catch (e) {
                updated.coordinates = { lat: 14.6349, lng: -90.5069 };
                updated.utcOffset = -6;
            }
        }

        // Sync local cache
        this.profilesCache[userId] = updated;
        await this.saveProfiles();

        // Supabase Sync
        if (config.SUPABASE_URL) {
            const payload = {
                id: userId,
                name: updated.name,
                full_name: updated.name,
                birth_date: updated.birthDate,
                birth_time: updated.birthTime,
                birth_location: updated.birthCity,
                plan_type: updated.plan_type,
                onboarding_completed: updated.onboarding_completed,
                profile_data: updated,
                updated_at: new Date().toISOString()
            };
            await supabase.from('profiles').upsert(payload);
        }

        return updated;
    }

    static getRawState() { return this.profilesCache; }
}
