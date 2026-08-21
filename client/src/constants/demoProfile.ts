import type { UserProfile } from '../contexts/ProfileContext';

export const DEMO_USER_ID = 'demo-user-1234-abcd';
export const DEMO_PARTNER_ID = 'demo-partner-5678-efgh';

export const DEMO_PROFILE: UserProfile = {
    id: DEMO_USER_ID,
    email: 'demo@naosos.app',
    name: 'Neo',
    birthDate: '1986-07-12',
    birthTime: '12:00',
    birthCity: 'Latinoamérica',
    created_at: new Date().toISOString(),
    onboarding_completed: true,
    subscription: { plan: 'FREE', features: [] },
    
    // Astrology
    sun_sign: 'Cáncer',
    moon_sign: 'Virgo',
    ascendant_sign: 'Libra',

    // Numerology
    life_path_number: 11,

    // Maya
    maya_nahual: 'BATZ',
    maya_tone: 7,

    // Chinese
    chinese_animal: 'caballo',
    chinese_element: 'Metal',

    // Energy Code
    naos_code: 'Aries · 11 · B\'atz\' · Caballo'
};

export const DEMO_PARTNER_PROFILE: UserProfile = {
    id: DEMO_PARTNER_ID,
    email: 'partner@naosos.app',
    name: 'Luminary',
    birth_date: '1992-10-23',
    birth_time: '08:15',
    birth_place: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
    created_at: new Date().toISOString(),
    is_premium: false,

    sun_sign: 'Libra',
    moon_sign: 'Piscis',
    ascendant_sign: 'Escorpio',

    life_path_number: 9,

    maya_nahual: 'AJMAQ',
    maya_tone: 3,

    chinese_animal: 'mono',
    chinese_element: 'Agua',

    naos_code: 'Libra · 9 · Ajmaq · Mono'
};
