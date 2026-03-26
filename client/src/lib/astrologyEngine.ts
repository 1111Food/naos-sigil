// Note: astronomy-engine exports might differ, I will use the namespace style if imports fail, 
// but based on typical usage 'Astronomy' is the main export. 
// However, the module system might require: import * as Astronomy from 'astronomy-engine';

import * as Astronomy from 'astronomy-engine';

export interface PlanetPosition {
    name: string;
    sign: string;
    degree: number; // 0-29.99 within sign
    absDegree: number; // 0-360
    house: number;
    retrograde: boolean;
}

export interface HouseCusp {
    house: number;
    sign: string;
    degree: number;
    absDegree: number;
}

export interface NatalChart {
    ascendant: number; // absDegree
    midheaven: number; // absDegree
    planets: PlanetPosition[];
    houses: HouseCusp[];
    elements: { fire: number; earth: number; air: number; water: number };
    modalities: { cardinal: number; fixed: number; mutable: number };
}

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export class AstrologyEngine {

    static calculateNatalChart(date: any, lat: number, lng: number): any {
        // Safety: ensure date is valid and coordinates are numbers to prevent astronomy-engine crash
        const d = new Date(date);
        const safeLat = Number(lat) || 0;
        const safeLng = Number(lng) || 0;

        if (isNaN(d.getTime())) {
            console.warn("AstrologyEngine: Invalid date provided. Returning empty chart.");
            return { planets: [], houses: [], aspects: [], elements: { fire: 0, earth: 0, air: 0, water: 0 }, modalities: { cardinal: 0, fixed: 0, mutable: 0 } };
        }
        
        try {
            const observer = new Astronomy.Observer(safeLat, safeLng, 0);
            const time = Astronomy.MakeTime(d);

            // Calculate Ascendant & MC
            const gst = Astronomy.SiderealTime(time);
            const lst = (gst + safeLng / 15.0) % 24;

            const t = (time.date.getTime() / 1000 - 946728000) / 3155760000;
            const eps = 23.4392911 - (46.8150 * t) / 3600 - (0.00059 * t * t) / 3600 + (0.001813 * t * t * t) / 3600;
            const epsRad = eps * Math.PI / 180.0;

            const ramc = lst * 15.0;
            const ramcRad = ramc * Math.PI / 180.0;
            const latRad = safeLat * Math.PI / 180.0;

            let mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad));
            let mc = (mcRad * 180.0 / Math.PI + 360) % 360;

            const ascY = Math.cos(ramcRad);
            const ascX = - (Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
            let ascRad = Math.atan2(ascY, ascX);
            let asc = (ascRad * 180.0 / Math.PI + 360) % 360;

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

            const planets: PlanetPosition[] = [];

            bodies.forEach(b => {
                const eq = Astronomy.Equator(b.body, time, observer, true, true);
                const tCent = (time.date.getTime() / 1000 - 946728000) / (36525 * 24 * 3600);
                const epsilon = 23.4392911 - (46.8150 * tCent) / 3600 - (0.00059 * tCent * tCent) / 3600 + (0.001813 * tCent * tCent * tCent) / 3600;
                const epsilonRad = epsilon * Math.PI / 180.0;

                const y_ecl = eq.vec.y * Math.cos(epsilonRad) + eq.vec.z * Math.sin(epsilonRad);
                let lon = Math.atan2(y_ecl, eq.vec.x) * 180 / Math.PI;
                if (lon < 0) lon += 360;

                const absDeg = lon;
                if (isNaN(absDeg)) {
                    planets.push({ name: b.name, sign: 'Unknown', degree: 0, absDegree: 0, house: 0, retrograde: false });
                    return;
                }

                const signIdx = Math.floor(absDeg / 30);
                const sign = ZODIAC_SIGNS[signIdx] || 'Unknown';
                const deg = absDeg % 30;
                const house = Math.floor(((absDeg - asc + 360) % 360) / 30) + 1;

                const time6h = time.AddDays(0.25);
                const eq6h = Astronomy.Equator(b.body, time6h, observer, true, true);
                const y_ecl6h = eq6h.vec.y * Math.cos(epsilonRad) + eq6h.vec.z * Math.sin(epsilonRad);
                let lon6h = Math.atan2(y_ecl6h, eq6h.vec.x) * 180 / Math.PI;
                if (lon6h < 0) lon6h += 360;

                const speed = (lon6h - lon + 360) % 360;
                const correctedSpeed = speed > 180 ? speed - 360 : speed;

                planets.push({
                    name: b.name,
                    sign,
                    degree: Math.round(deg * 100) / 100,
                    absDegree: absDeg,
                    house: isNaN(house) ? 0 : house,
                    retrograde: correctedSpeed < 0
                });
            });

            const houses: HouseCusp[] = [];
            for (let i = 1; i <= 12; i++) {
                const houseStart = (asc + (i - 1) * 30) % 360;
                const signIdx = Math.floor(houseStart / 30);
                houses.push({
                    house: i,
                    sign: ZODIAC_SIGNS[signIdx] || 'Unknown',
                    degree: houseStart % 30,
                    absDegree: houseStart
                });
            }

            const elementsCount = { fire: 0, earth: 0, air: 0, water: 0 };
            const modalitiesCount = { cardinal: 0, fixed: 0, mutable: 0 };

            const elemMap = ['fire', 'earth', 'air', 'water'];
            const modMap = ['cardinal', 'fixed', 'mutable'];

            planets.forEach(p => {
                if (p.sign === 'Unknown') return;
                const sIdx = ZODIAC_SIGNS.indexOf(p.sign);
                if (sIdx === -1) return;
                const elem = elemMap[sIdx % 4];
                const mod = modMap[sIdx % 3];
                // @ts-ignore
                elementsCount[elem]++;
                // @ts-ignore
                modalitiesCount[mod]++;
            });

            return {
                ascendant: asc,
                midheaven: mc,
                planets,
                houses,
                elements: elementsCount,
                modalities: modalitiesCount
            };
        } catch (error) {
            console.error("AstrologyEngine: Critical error in calculation:", error);
            return { planets: [], houses: [], aspects: [], elements: { fire: 0, earth: 0, air: 0, water: 0 }, modalities: { cardinal: 0, fixed: 0, mutable: 0 } };
        }
    }
}
