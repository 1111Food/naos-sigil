import type { UserProfile } from '../contexts/ProfileContext';

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';
export const DEMO_PARTNER_ID = '11111111-1111-1111-1111-111111111111';

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
    life_path_number: 7,

    // Maya
    maya_nahual: 'Imox',
    maya_tone: 10,

    // Chinese
    chinese_animal: 'tigre',
    chinese_element: 'Fuego',

    // Energy Code
    naos_code: 'Cáncer · 7 · Imox · Tigre'
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
