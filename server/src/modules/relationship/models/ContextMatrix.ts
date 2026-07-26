export interface ContextMatrix {
    ageDifference: number;
    timeTogetherMonths: number;
    relationshipType: string;
    lifecycleStage: string;
    goals: string[];
    currentObjective: string;  // e.g. "Casarse", "Crear empresa"
    recentEvents: string[];
    individualCoherenceA: number;
    individualCoherenceB: number;
    premiumStatus: boolean;
    language: 'es' | 'en';     // Used by the Consultant Engine for generation
}
