import * as Astronomy from 'astronomy-engine';

export class TransitEngine {
    static calculateCurrentTransits(date: Date, lat: number, lng: number) {
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

        const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

        const transits = bodies.map(b => {
            const eq = Astronomy.Equator(b.body, time, observer, true, true);
            const y_ecl = eq.vec.y * Math.cos(epsRad) + eq.vec.z * Math.sin(epsRad);
            let lon = Math.atan2(y_ecl, eq.vec.x) * 180 / Math.PI;
            lon = (lon + 360) % 360;
            
            const signIndex = Math.floor(lon / 30);
            return {
                name: b.name,
                sign: ZODIAC[signIndex],
                absDegree: lon
            };
        });

        return transits;
    }
}
