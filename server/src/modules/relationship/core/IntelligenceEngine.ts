import { Signal, SignalSourceType } from '../models/Signal';
import { Metric } from '../models/Metric';
import { ContextMatrix } from '../models/ContextMatrix';

/**
 * IntelligenceEngine is the mathematical core of RIP.
 * It takes all standardized signals and context to calculate 
 * the unified metrics (Scores, Probabilities, Risks, Coherence).
 */
export class IntelligenceEngine {

    public calculateMetrics(signals: Signal[], context: ContextMatrix): Metric[] {
        const metrics: Metric[] = [];
        
        // Extract signals for easy access
        const astroSignal = signals.find(s => s.sourceType === SignalSourceType.ASTROLOGY);
        const numSignal = signals.find(s => s.sourceType === SignalSourceType.NUMEROLOGY);
        const mayaSignal = signals.find(s => s.sourceType === SignalSourceType.MAYAN);
        const chineseSignal = signals.find(s => s.sourceType === SignalSourceType.CHINESE);

        // 1. Calculate Core Compatibility Metric
        // This replaces the old 'coreScore'
        let compatValue = 50;
        let compatContributors = [];
        let compatConfidence = 100;

        if (astroSignal) {
            // Pseudo-calculation: integrate real math later
            compatValue += 10; 
            compatContributors.push({ sourceName: 'Astrology', impact: 10 });
            compatConfidence = Math.min(compatConfidence, astroSignal.confidence);
        }
        
        if (numSignal) {
            compatValue += 15;
            compatContributors.push({ sourceName: 'Numerology', impact: 15 });
            compatConfidence = Math.min(compatConfidence, numSignal.confidence);
        }

        metrics.push({
            name: 'CoreCompatibility',
            value: Math.min(compatValue, 100),
            confidence: compatConfidence,
            trend: 0, // Defaults to 0, AdaptiveEngine will update this based on snapshots
            weight: 1.0,
            contributors: compatContributors
        });

        // 2. Calculate Coherence Metric
        // Coherence = (individualCoherenceA + individualCoherenceB) / 2 modulated by Compatibility
        const baseCoherence = (context.individualCoherenceA + context.individualCoherenceB) / 2 || 50;
        const coherenceValue = Math.round((baseCoherence * 0.7) + (compatValue * 0.3));

        metrics.push({
            name: 'RelationalCoherence',
            value: Math.min(coherenceValue, 100),
            confidence: 100, // Derived from user check-ins
            trend: 0,
            weight: 1.5, // High importance
            contributors: [
                { sourceName: 'IndividualCoherence', impact: 70 },
                { sourceName: 'CoreCompatibility', impact: 30 }
            ]
        });

        // 3. Calculate Risk Metrics (e.g. Burnout Risk)
        let burnoutValue = 30; // Base risk
        let burnoutContributors = [];
        if (chineseSignal && mayaSignal) {
            burnoutValue += 20; // Pseudo-calc
            burnoutContributors.push({ sourceName: 'KarmicFriction', impact: 20 });
        }
        metrics.push({
            name: 'BurnoutRisk',
            value: Math.min(burnoutValue, 100),
            confidence: 90,
            trend: 0,
            weight: 0.8,
            contributors: burnoutContributors
        });

        return metrics;
    }
}
