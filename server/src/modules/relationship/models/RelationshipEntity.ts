export enum LifecycleStage {
    FORMATION = 'FORMATION',
    GROWTH = 'GROWTH',
    EXPANSION = 'EXPANSION',
    STABILITY = 'STABILITY',
    STRESS = 'STRESS',
    TRANSFORMATION = 'TRANSFORMATION',
    CLOSURE = 'CLOSURE'
}

export interface RelationshipEntity {
    id: string;
    userAId: string;
    userBId: string;
    relationshipType: string;
    lifecycleStage: LifecycleStage;
    createdAt: Date;
    updatedAt: Date;
}
