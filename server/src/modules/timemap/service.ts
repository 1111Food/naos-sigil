import { EphemerisService, PlanetaryPosition } from '../ephemeris/service';
import { NaosSignal } from '../signals/types';
import { SignalEngine } from '../signals/service';

export interface TransitSignal {
    aspect: string;
    body: string;
    angle: number;
    description: string;
}

export class TimeMapEngine {
    
    /**
     * Calculates deterministic transits based on current NASA/JPL positions.
     * Generates a structural Signal for Context 2.0.
     */
    static async calculateCurrentTransits(): Promise<NaosSignal<TransitSignal[]>> {
        // 1. Obtener Astronomical Data (Ephemeris)
        const ephemerisSignal = await EphemerisService.getEphemerisSignal();
        const positions = ephemerisSignal.value as PlanetaryPosition[];
        
        // 2. Deterministic Calculation (Transits)
        const transits = this.computeAspects(positions);

        // 3. Empaquetar como Temporal Signal
        return SignalEngine.normalize(
            'TEMPORAL',
            transits,
            {
                source: 'NAOS_TIMEMAP_ENGINE',
                source_version: '2.0',
                method: 'deterministic_transit_calculation'
            },
            {
                confidence: 1.0 // Sigue siendo determinista, no inferencial psicológico aún
            }
        );
    }

    private static computeAspects(positions: PlanetaryPosition[]): TransitSignal[] {
        const transits: TransitSignal[] = [];
        
        // Mock computation of aspects.
        // En producción real, calcularíamos la distancia angular entre posiciones y puntos natales.
        // Por ahora, generamos un cruce determinista base.
        const sun = positions.find(p => p.body === 'Sun');
        const moon = positions.find(p => p.body === 'Moon');

        if (sun && moon) {
            const angle = Math.abs(sun.longitude - moon.longitude) % 360;
            if (angle < 10 || angle > 350) {
                transits.push({ aspect: 'Conjunction', body: 'Moon-Sun', angle, description: 'New Moon phase aspect' });
            } else if (angle > 170 && angle < 190) {
                transits.push({ aspect: 'Opposition', body: 'Moon-Sun', angle, description: 'Full Moon phase aspect' });
            }
        }

        return transits;
    }
}
