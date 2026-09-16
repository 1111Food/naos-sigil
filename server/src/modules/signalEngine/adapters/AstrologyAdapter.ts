import { NaosSignal, SignalDirection } from '../models/NaosSignal';
import { AspectResult } from '../../astrology/TransitEngine';
import * as crypto from 'crypto';

export type PlanetClass = 'PERSONAL' | 'OUTER';

export class AstrologyAdapter {
    static adaptAspects(aspects: AspectResult[], localDate: string, calculatedAt: string): NaosSignal[] {
        const signals = aspects.map(aspect => {
            const direction = this.getAspectDirection(aspect.aspectType);
            
            // Generate deterministic ID
            const hashInput = `ASTROLOGY|TRANSIT|${aspect.transitPlanet}|${aspect.aspectType}|${aspect.natalTarget}|${localDate}`;
            const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);
            
            // Exactness Normalization (Max orb in TransitEngine is universally 3.0)
            const rawExactness = Math.max(0, 1.0 - (aspect.orb / 3.0));
            const intensity = Math.round(rawExactness * 1000) / 1000;

            const transitClass = this.getPlanetClass(aspect.transitPlanet);
            const targetClass = this.getPlanetClass(aspect.natalTarget);

            const signal: NaosSignal = {
                id: `ASTROLOGY.TRANSIT.${idHash}`,
                signalType: 'ASTROLOGY',
                subject: 'ACCOUNT_OWNER',
                timestamp: localDate,
                temporalScope: 'TRANSIT',
                direction,
                intensity,
                specificity: null, 
                provenance: {
                    engine: 'TransitEngine',
                    methodologyId: 'ASTRO_TRANSIT_ASPECT_V1',
                    calculatedAt,
                    inputs: { 
                        transitPlanet: aspect.transitPlanet, 
                        natalTarget: aspect.natalTarget, 
                        orb: aspect.orb 
                    }
                },
                payload: {
                    aspectType: aspect.aspectType,
                    exactAngle: aspect.exactAngle,
                    actualSeparation: aspect.actualSeparation,
                    isPriority: aspect.isPriority,
                    transitPlanetClass: transitClass,
                    natalTargetClass: targetClass,
                    interpretationStatus: direction === 'NEUTRAL' && !['Conjunction', 'Trine', 'Sextile', 'Square', 'Opposition'].includes(aspect.aspectType) ? 'UNMAPPED' : 'MAPPED'
                }
            };
            return signal;
        });

        // Ensure order determinism
        return signals.sort((a, b) => a.id.localeCompare(b.id));
    }

    private static getAspectDirection(aspectType: string): SignalDirection {
        switch (aspectType) {
            case 'Trine':
            case 'Sextile':
                return 'SUPPORTIVE';
            case 'Square':
            case 'Opposition':
                return 'CHALLENGING';
            case 'Conjunction':
                return 'MIXED'; // Context-dependent on planets
            default:
                return 'NEUTRAL'; // Safe fallback for unknown future aspects
        }
    }

    private static getPlanetClass(planetName: string): PlanetClass {
        if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant'].includes(planetName)) {
            return 'PERSONAL';
        }
        return 'OUTER';
    }
}
