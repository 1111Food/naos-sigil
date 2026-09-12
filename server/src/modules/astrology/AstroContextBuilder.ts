export class AstroContextBuilder {
    static normalize(profile: any) {
        let astro = null;
        let provenance = 'unknown';

        if (profile?.profile_data?.astrology) {
            astro = profile.profile_data.astrology;
            provenance = 'profile_data.astrology';
        } else if (profile?.astrology) {
            astro = profile.astrology;
            provenance = 'astrology';
        } else if (profile?.natal_chart) {
            astro = profile.natal_chart;
            provenance = 'natal_chart';
        }

        if (!astro) return null;

        const getSign = (deg: number | undefined | null) => {
            if (deg === undefined || deg === null || isNaN(deg)) return 'Unknown';
            const normalized = ((deg % 360) + 360) % 360; // Normalize 0..360 safely
            const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            return ZODIAC[Math.floor(normalized / 30) % 12];
        };

        const sunObj = astro.planets?.find((p: any) => p.name === 'Sun') || astro.sun;
        const moonObj = astro.planets?.find((p: any) => p.name === 'Moon') || astro.moon;
        
        const ascDegree = astro.ascendant !== undefined ? astro.ascendant : astro.rising?.absDegree;
        const mcDegree = astro.midheaven !== undefined ? astro.midheaven : astro.mc?.absDegree; 

        return {
            sunSign: sunObj?.sign || astro.sunSign || getSign(sunObj?.absDegree),
            moonSign: moonObj?.sign || astro.moonSign || getSign(moonObj?.absDegree),
            ascendantSign: astro.rising?.sign || astro.risingSign || getSign(ascDegree),
            ascendantDegrees: ascDegree !== undefined ? ascDegree : null,
            midheavenDegrees: mcDegree !== undefined ? mcDegree : null,
            planets: astro.planets || [],
            houses: astro.houses || [],
            version: 2,
            provenance
        };
    }
}
