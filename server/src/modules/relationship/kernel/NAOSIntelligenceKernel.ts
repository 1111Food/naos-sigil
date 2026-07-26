import { SignalEngine } from '../core/SignalEngine';
import { IntelligenceEngine } from '../core/IntelligenceEngine';
import { ExplainabilityEngine } from '../core/ExplainabilityEngine';
import { AdaptiveEngine } from '../core/AdaptiveEngine';
import { RelationshipConsultant, ConsultantMode } from '../consultant/RelationshipConsultant';
import { ContextMatrix } from '../models/ContextMatrix';
import { RelationshipEntity } from '../models/RelationshipEntity';

/**
 * NAOS Intelligence Kernel is the central orchestrator of the entire 
 * Relationship Intelligence Platform. It coordinates the data flow 
 * between all engines.
 */
export class NAOSIntelligenceKernel {
    private signalEngine = new SignalEngine();
    private intelligenceEngine = new IntelligenceEngine();
    private explainabilityEngine = new ExplainabilityEngine();
    private adaptiveEngine = new AdaptiveEngine();
    private consultant = new RelationshipConsultant();

    /**
     * The main entry point to process a relationship consultation.
     */
    public async process(
        entity: RelationshipEntity, 
        userA: any, 
        userB: any, 
        context: ContextMatrix, 
        mode: ConsultantMode
    ): Promise<any> {
        
        // 1. Ingest & Normalize Signals
        const signals = await this.signalEngine.processSignals(userA, userB);
        
        // 2. Mathematical Processing
        let metrics = this.intelligenceEngine.calculateMetrics(signals, context);
        
        // 3. Learning & Adjustments
        metrics = this.adaptiveEngine.adjustWeights(metrics);
        this.adaptiveEngine.learnFromHistory(entity, metrics);
        
        // 4. Transparency
        metrics = this.explainabilityEngine.enrichMetrics(metrics);
        
        // 5. Generative AI Consultation
        const consultation = await this.consultant.consult(metrics, context, mode);
        
        return {
            entityId: entity.id,
            metrics,
            consultation
        };
    }
}
