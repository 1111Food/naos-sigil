export const getNahualImage = (id: string): string => {
    // Los archivos fueron subidos en MAYÚSCULAS (ej. BATZ.webp)
    const normalizedId = id.toUpperCase().trim();
    // Vite constructor for static assets
    return new URL(`../assets/nahuales/${normalizedId}.webp`, import.meta.url).href;
};

export const getMayanToneName = (tone: number, language: string = 'es'): string => {
    const isEn = language === 'en';
    const tones_es: Record<number, string> = {
        1: 'Magnético', 2: 'Lunar', 3: 'Eléctrico', 4: 'Auto-Existente',
        5: 'Entonado', 6: 'Rítmico', 7: 'Resonante', 8: 'Galáctico',
        9: 'Solar', 10: 'Planetario', 11: 'Espectral', 12: 'Cristal', 13: 'Cósmico'
    };
    const tones_en: Record<number, string> = {
        1: 'Magnetic', 2: 'Lunar', 3: 'Electric', 4: 'Self-Existing',
        5: 'Overtone', 6: 'Rhythmic', 7: 'Resonant', 8: 'Galactic',
        9: 'Solar', 10: 'Planetary', 11: 'Spectral', 12: 'Crystal', 13: 'Cosmic'
    };
    const tones = isEn ? tones_en : tones_es;
    return tones[tone] || String(tone);
};
