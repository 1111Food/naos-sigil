export interface NarrativeModule {
    id: string;             // e.g. 'love', 'business', 'shadow'
    title: string;          // e.g. 'Love & Emotional Dynamics'
    icon: string;           // e.g. 'Heart', 'Briefcase', 'Moon'
    priority: number;       // For sorting
    summary: string;
    deepAnalysis: string;
    keyInsights: string[];
    recommendations: string[];
    confidence: number;
    evidence: string[];
    limitations: string[];
    actions: { step: number, action: string }[];
}

export interface Scenario {
    id: string;
    title: string;          // e.g. 'Construir una empresa', 'Formar una familia'
    probability: number;    // 0-100
    strengths: string[];
    risks: string[];
    whatToDo: string[];
    description: string;
}

export interface ContextCompatibility {
    context: string;        // e.g. 'Romance', 'Business', 'Friendship', 'Parenting', 'Travel', 'Living Together'
    score: number;          // 0-100
}

export interface RelationshipReport {
    executiveSummary: {
        type: string;
        potential: string;
        risk: string;
        coreMemory: string;
    };
    modules: NarrativeModule[];
    scenarios: Scenario[];
    contextCompatibility: ContextCompatibility[];
    topOpportunities: string[];
    topRisks: string[];
    actionPlan90Days: { step: number, action: string }[];
}
