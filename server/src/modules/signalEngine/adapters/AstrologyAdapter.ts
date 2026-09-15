import { NaosSignal, SignalDirection } from '../models/NaosSignal';
import { AspectResult } from '../../astrology/TransitEngine';
import * as crypto from 'crypto';

export class AstrologyAdapter {
    static adaptAspects(aspects: AspectResult[], localDate: string, calculatedAt: string): NaosSignal[] {
        return aspects.map(aspect => {
            const direction = this.getAspectDirection(aspect.aspectType);
            
            // Generate deterministic ID
            const hashInput = `ASTROLOGY|TRANSIT|${aspect.transitPlanet}|${aspect.aspectType}|${aspect.natalTarget}|${localDate}`;
            const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);
            
            // Calculate a deterministic intensity based on orb tightness. 
            // Max allowed orb in TransitEngine is currently 3. 
            // Smaller orb = higher intensity.
            // Example basic formula: 1.0 - (orb / 3.0) -> scaled to 0-1.
            const rawIntensity = Math.max(0, 1.0 - (aspect.orb / 3.0));
            // Round to 3 decimals
            const intensity = Math.round(rawIntensity * 1000) / 1000;

            const signal: NaosSignal = {
                id: `ASTROLOGY.TRANSIT.${idHash}`,
                signalType: 'ASTROLOGY',
                subject: 'ACCOUNT_OWNER',
                timestamp: localDate,
                temporalScope: 'TRANSIT',
                direction,
                intensity,
                specificity: null, // To be calculated in Part 2
                provenance: {
                    engine: 'TransitEngine',
                    methodologyId: 'ASTRO_TRANSIT_V1',
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
                    isPriority: aspect.isPriority
                }
            };
            return signal;
        });
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
                return 'MIXED'; // Depends heavily on the planets involved
            default:
                return 'NEUTRAL';
        }
    }
}
