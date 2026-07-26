export interface MetricContributor {
    sourceName: string;
    impact: number;
}

export interface Metric {
    name: string;               // e.g. "Compatibility", "Trust", "BurnoutRisk"
    value: number;              // 0-100
    confidence: number;         // 0-100
    trend: number;              // +/- trend over time
    weight: number;             // Importance weight
    contributors: MetricContributor[];
    explanation?: string;       // Explainability Engine reasoning
    limitations?: string[];     // E.g. ["Missing birth time", "Sparse check-ins"]
}
