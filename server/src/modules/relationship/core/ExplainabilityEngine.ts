import { Metric } from '../models/Metric';

/**
 * ExplainabilityEngine is responsible for providing mathematical 
 * transparency. It injects the "explanation" and "limitations" 
 * fields into the calculated Metrics, answering WHY a score is what it is.
 */
export class ExplainabilityEngine {

    public enrichMetrics(metrics: Metric[]): Metric[] {
        // TODO: Analyze the contributors of each metric and generate human-readable technical explanations
        return metrics;
    }
}
