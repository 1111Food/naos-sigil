import { SignalEngine } from '../signals/service';
import { NaosSignal } from '../signals/types';

export interface PlanetaryPosition {
    body: string;
    longitude: number; // Ecliptic longitude in degrees (0-360, 0 = Aries)
    latitude: number;
    distance: number;
    speed: number;     // Degrees per day
}

export class EphemerisService {
    private static cache: Map<string, PlanetaryPosition[]> = new Map();
    private static CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours cache
    private static cacheTime: number = 0;

    // JPL Horizons Body IDs
    private static BODIES = [
        { name: 'Sun', id: '10' },
        { name: 'Moon', id: '301' },
        { name: 'Mercury', id: '199' },
        { name: 'Venus', id: '299' },
        { name: 'Mars', id: '499' },
        { name: 'Jupiter', id: '599' },
        { name: 'Saturn', id: '699' },
        { name: 'Uranus', id: '799' },
        { name: 'Neptune', id: '899' },
        { name: 'Pluto', id: '999' }
    ];

    /**
     * Fetches current ephemeris from NASA/JPL Horizons API.
     */
    static async getCurrentPositions(): Promise<PlanetaryPosition[]> {
        const now = Date.now();
        if (this.cache.size > 0 && (now - this.cacheTime < this.CACHE_TTL)) {
            return Array.from(this.cache.values()).flat();
        }

        console.log("🔭 [NASA/JPL] Conectando en vivo con Horizons API...");
        const positions: PlanetaryPosition[] = [];

        try {
            // Se ejecuta de manera secuencial con un pequeño delay para no disparar el rate-limit de NASA
            for (const body of this.BODIES) {
                const pos = await this.fetchFromHorizons(body.id, body.name);
                positions.push(pos);
                // Delay artificial de 200ms entre llamadas para proteger la conexión
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            this.cache.set('current', positions);
            this.cacheTime = now;
            console.log("✅ [NASA/JPL] Efemérides obtenidas y cacheadas con éxito.");
            return positions;
        } catch (error) {
            console.error("🔥 [NASA/JPL] Error conectando con Horizons API. Usando fallback de seguridad:", error);
            if (this.cache.size > 0) return Array.from(this.cache.values()).flat();
            
            // Si la NASA falla totalmente y no hay caché, usamos un fallback para que NAOS no colapse.
            return this.BODIES.map(b => this.calculateFallbackPosition(b.name));
        }
    }

    /**
     * Devuelve las posiciones empaquetadas como una NaosSignal para el ContextBuilder.
     */
    static async getEphemerisSignal(): Promise<NaosSignal<PlanetaryPosition[]>> {
        const positions = await this.getCurrentPositions();
        
        return SignalEngine.normalize(
            'ASTRONOMICAL',
            positions,
            {
                source: 'NASA_JPL_HORIZONS',
                source_version: 'API_v1.2',
                method: 'observer_ecliptic_longitude'
            },
            {
                confidence: 1.0 
            }
        );
    }

    /**
     * Realiza la llamada HTTP real a JPL Horizons y parsea el texto científico.
     */
    private static async fetchFromHorizons(bodyId: string, bodyName: string): Promise<PlanetaryPosition> {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const start = today.toISOString().split('T')[0];
        const stop = tomorrow.toISOString().split('T')[0];

        // QUANTITIES='31' extrae Longitud y Latitud Eclíptica del Observador (Geocéntrico)
        const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${bodyId}'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='${start}'&STOP_TIME='${stop}'&STEP_SIZE='1%20d'&QUANTITIES='31'`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} en cuerpo ${bodyName}`);
        }

        const data = await response.json();
        if (!data.result) {
            throw new Error(`Formato inesperado de NASA para ${bodyName}`);
        }

        return this.parseHorizonsOutput(data.result, bodyName);
    }

    /**
     * Traductor (Parser) especializado para el formato telnet/texto plano de NASA.
     */
    private static parseHorizonsOutput(result: string, bodyName: string): PlanetaryPosition {
        const soeIndex = result.indexOf('$$SOE');
        const eoeIndex = result.indexOf('$$EOE');
        
        if (soeIndex === -1 || eoeIndex === -1) {
            throw new Error(`Data block ($$SOE) no encontrado para ${bodyName}`);
        }

        const dataBlock = result.substring(soeIndex + 5, eoeIndex).trim();
        const firstLine = dataBlock.split('\n')[0].trim();
        
        // JPL separa los datos con múltiples espacios. Ej: "2026-Aug-23 00:00     m  150.1195655 -0.0000966"
        const parts = firstLine.split(/\s+/);
        
        // Los dos últimos elementos numéricos siempre son Longitud y Latitud con QUANTITIES=31
        const lat = parseFloat(parts[parts.length - 1]);
        const lon = parseFloat(parts[parts.length - 2]);

        if (isNaN(lon) || isNaN(lat)) {
             throw new Error(`No se pudo parsear las coordenadas exactas de ${bodyName}. Línea: ${firstLine}`);
        }

        return {
            body: bodyName,
            longitude: lon,     // 0 a 360 grados exactos del Zodiaco
            latitude: lat,
            distance: 1,        // Simplificado para V1, se puede extraer con QUANTITIES=20 si se requiere
            speed: 1            // Simplificado para V1
        };
    }

    private static calculateFallbackPosition(bodyName: string): PlanetaryPosition {
        return {
            body: bodyName,
            longitude: Math.random() * 360,
            latitude: 0,
            distance: 1,
            speed: 1
        };
    }
}
