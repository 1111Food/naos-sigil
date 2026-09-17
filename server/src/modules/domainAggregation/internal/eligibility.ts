import { CanonicalDomain } from '../../domainProjection/types';

// CORE_RECIPE_SECRET
// Determines which systems are mathematically expected in the coverage denominator for each domain.
// This strictly reflects Part 7 projection capabilities.
export const ELIGIBILITY_MATRIX: Record<CanonicalDomain, string[]> = {
    'ACTION_INITIATIVE': ['ASTROLOGY', 'MAYA', 'CHINESE', 'NUMEROLOGY'],
    'RELATIONSHIPS_LOVE': ['ASTROLOGY', 'MAYA', 'CHINESE', 'NUMEROLOGY'],
    'BUSINESS_EXPANSION': ['ASTROLOGY', 'MAYA', 'CHINESE', 'NUMEROLOGY'],
    'COMMUNICATION_LEARNING': ['ASTROLOGY', 'MAYA', 'CHINESE', 'NUMEROLOGY'],
    'BODY_REGULATION': ['ASTROLOGY', 'MAYA', 'CHINESE', 'NUMEROLOGY'],
    'INTROSPECTION_RECOVERY': ['ASTROLOGY', 'MAYA', 'CHINESE', 'NUMEROLOGY']
};

// Fact Contexts (USER_STATED, SYSTEM_VERIFIED) aren't counted in the standard
// symbolic Coverage denominator because they aren't predictive/continuous emitting systems.
