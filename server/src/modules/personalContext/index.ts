/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Public barrel export.
 */

export * from './types';
export { PersonalContextEngine } from './PersonalContextEngine';
export { PersonalContextAssembler, AssembleContextOptions, SourceReaders } from './PersonalContextAssembler';
export { resolveContextKey } from './conflictResolver';
export { buildDeterministicId, buildEphemeralId, buildContextItem } from './utils';

// Adapters
export { ProfileContextAdapter } from './adapters/ProfileContextAdapter';
export { ProtocolContextAdapter } from './adapters/ProtocolContextAdapter';
export { CoherenceContextAdapter } from './adapters/CoherenceContextAdapter';
export { MemoryContextAdapter } from './adapters/MemoryContextAdapter';
export { UserStatedContextAdapter } from './adapters/UserStatedContextAdapter';
