export type CanonicalDomain = 
    | 'ACTION_INITIATIVE'
    | 'RELATIONSHIPS_LOVE'
    | 'BUSINESS_EXPANSION'
    | 'COMMUNICATION_LEARNING'
    | 'BODY_REGULATION'
    | 'INTROSPECTION_RECOVERY';

export type DomainRelevanceClass = 'PRIMARY' | 'SECONDARY' | 'CONTEXTUAL';

export type SourceKind = 'SYMBOLIC_SIGNAL' | 'FACTUAL_CONTEXT' | 'STRUCTURAL_BACKGROUND';

export interface DomainProvenance {
    projectionRuleId: string; // INTERNAL ONLY
}

export interface DomainEvidence {
    id: string; // Deterministic: {domain}.{relevanceClass}.{sourceId}
    domain: CanonicalDomain;
    relevanceClass: DomainRelevanceClass;
    
    sourceKind: SourceKind;
    sourceSystem: string;
    sourceId: string;
    
    direction: string;
    temporalScope: string;
    
    sourceAuthority?: string;
    sourceFreshness?: string;
    
    methodology: string; // e.g. DOMAIN_PROJECTION_V1
    provenance: DomainProvenance;
}
