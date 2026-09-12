import { NORMALIZED_CITIES } from './cityDb';
import { find } from 'geo-tz';

interface GeoCache {
    coordinates: Record<string, { lat: number, lng: number }>;
}

const cache: GeoCache = {
    coordinates: {}
};

export class GeocodingService {
    static async getCoordinates(city: string, state: string, country: string): Promise<{ lat: number, lng: number }> {
        const query = [city, country].filter(p => p && p.trim().length > 0).join(', ').toLowerCase().trim();

        const queryParts = [city, state, country].filter(p => p && p.trim().length > 0);
        const fullQuery = queryParts.join(', ').toLowerCase().trim();

        if (NORMALIZED_CITIES[query]) {
            return NORMALIZED_CITIES[query];
        }
        if (NORMALIZED_CITIES[fullQuery]) {
            return NORMALIZED_CITIES[fullQuery];
        }

        if (cache.coordinates[fullQuery]) {
            return cache.coordinates[fullQuery];
        }

        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&limit=1`;

        try {
            const response = await fetch(url, { headers: { 'User-Agent': 'NAOS-App (spiritual-ai-companion)' } });
            const data: any = await response.json();

            if (data && data.length > 0) {
                const result = {
                    lat: Math.round(parseFloat(data[0].lat) * 1000000) / 1000000,
                    lng: Math.round(parseFloat(data[0].lon) * 1000000) / 1000000
                };
                cache.coordinates[fullQuery] = result;
                return result;
            }
            return { lat: 14.634900, lng: -90.506900 };
        } catch (error) {
            return { lat: 14.6349, lng: -90.5069 };
        }
    }

    static getTimezoneId(lat: number, lng: number): string {
        try {
            const zones = find(lat, lng);
            if (zones && zones.length > 0) {
                return zones[0];
            }
        } catch (e) {
            console.error("geo-tz error:", e);
        }
        return 'America/Guatemala'; // Fallback
    }

    static getHistoricalUtcOffset(ianaTimezone: string, dateStr: string, timeStr: string): number {
        try {
            if (!dateStr || !timeStr) return -6;
            const [year, month, day] = dateStr.split('-').map(Number);
            const [hour, minute] = timeStr.split(':').map(Number);
            
            const format = new Intl.DateTimeFormat('en-US', {
                timeZone: ianaTimezone,
                timeZoneName: 'longOffset',
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric'
            });
            
            let testDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
            
            for (let i = 0; i < 3; i++) {
                const parts = format.formatToParts(testDate);
                const offsetPart = parts.find(p => p.type === 'timeZoneName');
                let val = offsetPart ? offsetPart.value.replace('GMT', '') : '';
                let offsetHours = 0;
                if (val) {
                    const [signH, m] = val.split(':');
                    const h = parseInt(signH, 10);
                    const min = parseInt(m || '0', 10);
                    offsetHours = h + (h >= 0 ? (min/60) : -(min/60));
                }
                
                const expectedUtc = Date.UTC(year, month - 1, day, hour, minute) - (offsetHours * 3600000);
                
                if (testDate.getTime() === expectedUtc) {
                    return offsetHours;
                }
                testDate = new Date(expectedUtc);
            }
            
            return -6;
        } catch (e) {
            console.error("getHistoricalUtcOffset error:", e);
            return -6;
        }
    }
}
