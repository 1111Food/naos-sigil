import * as Astronomy from 'astronomy-engine';

export interface TransitPosition {
    name: string;
    sign: string;
    absDegree: number;
}

export interface AspectResult {
    transitPlanet: string;
    natalTarget: string;
    aspectType: 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';
    exactAngle: number;
    actualSeparation: number;
    orb: number;
    isPriority: boolean;
}

export class TransitEngine {
    static readonly ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    // Core planets that we care about tracking aspects towards (Natal targets)
    static readonly NATAL_TARGETS = ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars'];
    
    static readonly MAJOR_ASPECTS = [
        { name: 'Conjunction', angle: 0 },
        { name: 'Sextile', angle: 60 },
        { name: 'Square', angle: 90 },
        { name: 'Trine', angle: 120 },
        { name: 'Opposition', angle: 180 }
    ];

    static calculateCurrentTransits(date: Date, lat: number, lng: number): TransitPosition[] {
        const observer = new Astronomy.Observer(lat, lng, 0);
        const time = Astronomy.MakeTime(date);

        const bodies = [
            { name: 'Sun', body: Astronomy.Body.Sun },
            { name: 'Moon', body: Astronomy.Body.Moon },
            { name: 'Mercury', body: Astronomy.Body.Mercury },
            { name: 'Venus', body: Astronomy.Body.Venus },
            { name: 'Mars', body: Astronomy.Body.Mars },
            { name: 'Jupiter', body: Astronomy.Body.Jupiter },
            { name: 'Saturn', body: Astronomy.Body.Saturn },
            { name: 'Uranus', body: Astronomy.Body.Uranus },
            { name: 'Neptune', body: Astronomy.Body.Neptune },
            { name: 'Pluto', body: Astronomy.Body.Pluto }
        ];

        // 1. Obliquity of Ecliptic of Date
        const t = (time.date.getTime() / 1000 - 946728000) / (36525 * 24 * 3600);
        const eps = 23.4392911 - (46.8150 * t) / 3600 - (0.00059 * t * t) / 3600 + (0.001813 * t * t * t) / 3600;
        const epsRad = eps * Math.PI / 180.0;

        return bodies.map(b => {
            const eq = Astronomy.Equator(b.body, time, observer, true, true);
            const y_ecl = eq.vec.y * Math.cos(epsRad) + eq.vec.z * Math.sin(epsRad);
            let lon = Math.atan2(y_ecl, eq.vec.x) * 180 / Math.PI;
            lon = (lon + 360) % 360;
            
            const signIndex = Math.floor(lon / 30);
            return {
                name: b.name,
                sign: this.ZODIAC[signIndex],
                absDegree: lon
            };
        });
    }

    /**
     * Calculates aspects between current transits and natal positions.
     * Evaluates relevance deterministically.
     */
    static calculateAspects(transits: TransitPosition[], natalPositions: Record<string, number>): AspectResult[] {
        const results: AspectResult[] = [];

        for (const transit of transits) {
            for (const targetName of this.NATAL_TARGETS) {
                const natalDegree = natalPositions[targetName];
                if (natalDegree === undefined) continue;

                // Shortest distance on a 360 degree circle
                let diff = Math.abs(transit.absDegree - natalDegree) % 360;
                let actualSeparation = diff > 180 ? 360 - diff : diff;

                for (const aspect of this.MAJOR_ASPECTS) {
                    const orb = Math.abs(actualSeparation - aspect.angle);
                    
                    // Base rules for matching an aspect
                    let maxOrb = 3; // Default generous orb for all signals
                                        // Relevance Engine (Priority Scoring)
                    // We define priority as: tighter orbs, conjuncts to Sun/Moon/Asc, or outer planets making rare transits
                    let isPriority = false;
                    
                    if (orb <= maxOrb) {
                        // Determine priority deterministically
                        if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(transit.name)) {
                            // Fast moving planets must be very tight to matter on a daily basis (< 1.5 deg)
                            // Allow ANY major aspect (not just conjunction) to personal planets to be priority if orb is tight
                            if (['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars'].includes(targetName)) {
                                if (orb <= 1.5) {
                                    isPriority = true; // Tight major aspect to personal planet
                                } else if (aspect.name === 'Conjunction' && ['Sun', 'Moon', 'Ascendant'].includes(targetName) && orb <= 2.5) {
                                    isPriority = true; // Slightly looser orb allowed for major conjunctions
                                }
                            }
                        } else {
                            // Slow moving planets (Jupiter - Pluto)
                            // They have long-lasting effects. Any major aspect < 2 deg to personal planets is a priority.
                            if (['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars'].includes(targetName) && orb <= 2.0) {
                                isPriority = true;
                            }
                        }

                        results.push({
                            transitPlanet: transit.name,
                            natalTarget: targetName,
                            aspectType: aspect.name as any,
                            exactAngle: aspect.angle,
                            actualSeparation: actualSeparation,
                            orb: orb,
                            isPriority: isPriority
                        });
                    }
                }
            }
        }

        return results;
    }
}
