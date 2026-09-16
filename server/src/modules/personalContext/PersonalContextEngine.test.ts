/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Test suite — Part 6.1 deterministic behavior gates.
 *
 * Required gates:
 *  - Authority ordering
 *  - MODEL_INFERENCE never overrides fact
 *  - RETRIEVED_MEMORY cannot override newer USER_STATED fact
 *  - Expired context excluded from CURRENT
 *  - Unresolved conflicts preserved (not guessed)
 *  - Profile allowlist enforced (no guardian_notes, no AI fields)
 *  - Protocol normalization
 *  - Coherence normalization
 *  - Memory unavailable non-fatal
 *  - Deterministic persisted-source IDs
 *  - ACCOUNT_OWNER subject isolation
 *  - No domain fields, no scores, no LLM calls
 *
 * Proof tests:
 *  A) Old RETRIEVED_MEMORY says goal = A; newer USER_STATED says goal = B → canonical current = B
 *  B) MODEL_INFERENCE says relationship = X; VERIFIED_STATE says relationship = Y → Y wins
 */

import { describe, it, expect } from 'vitest';

import {
  AUTHORITY_ORDER,
  AuthorityClass,
  PersonalContextItem,
  PersonalContextSubject,
} from './types';
import { resolveContextKey } from './conflictResolver';
import { buildContextItem, buildDeterministicId, buildEphemeralId } from './utils';
import { PersonalContextEngine } from './PersonalContextEngine';
import { ProfileContextAdapter, ProfileContextInput } from './adapters/ProfileContextAdapter';
import { ProtocolContextAdapter, ProtocolContextInput } from './adapters/ProtocolContextAdapter';
import { CoherenceContextAdapter, CoherenceContextInput } from './adapters/CoherenceContextAdapter';
import { MemoryContextAdapter } from './adapters/MemoryContextAdapter';
import { UserStatedContextAdapter, UserStatedFact } from './adapters/UserStatedContextAdapter';


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SUBJECT: PersonalContextSubject = { accountId: 'user-abc-123', subjectClass: 'ACCOUNT_OWNER' };
const NOW = '2026-09-16T12:00:00Z';

function makeItem(overrides: {
  contextKey: string;
  authorityClass: AuthorityClass;
  value: string;
  occurredAt?: string | null;
  validUntil?: string | null;
  structuredPayload?: Record<string, unknown>;
}): PersonalContextItem {
  return buildContextItem({
    subject: SUBJECT,
    contextKey: overrides.contextKey,
    authorityClass: overrides.authorityClass,
    value: overrides.value,
    freshness: 'CURRENT',
    occurredAt: overrides.occurredAt ?? null,
    observedAt: NOW,
    validFrom: null,
    validUntil: overrides.validUntil ?? null,
    structuredPayload: overrides.structuredPayload,
    provenance: {
      sourceType: 'SYSTEM',
      moduleName: 'TestHelper',
      sourceRef: 'test',
      authorityClass: overrides.authorityClass,
      observedAt: NOW,
    },
  });
}

// ---------------------------------------------------------------------------
// SECTION 1: Authority class ordering
// ---------------------------------------------------------------------------

describe('Authority ordering', () => {
  it('COMPUTED_CANONICAL has the highest authority (lowest ordinal)', () => {
    expect(AUTHORITY_ORDER['COMPUTED_CANONICAL']).toBeLessThan(AUTHORITY_ORDER['VERIFIED_STATE']);
    expect(AUTHORITY_ORDER['VERIFIED_STATE']).toBeLessThan(AUTHORITY_ORDER['USER_STATED']);
    expect(AUTHORITY_ORDER['USER_STATED']).toBeLessThan(AUTHORITY_ORDER['RETRIEVED_MEMORY']);
    expect(AUTHORITY_ORDER['RETRIEVED_MEMORY']).toBeLessThan(AUTHORITY_ORDER['MODEL_INFERENCE']);
  });

  it('resolves to COMPUTED_CANONICAL over VERIFIED_STATE', () => {
    const cc = makeItem({ contextKey: 'x', authorityClass: 'COMPUTED_CANONICAL', value: 'authoritative', occurredAt: '2026-09-01T00:00:00Z' });
    const vs = makeItem({ contextKey: 'x', authorityClass: 'VERIFIED_STATE', value: 'secondary', occurredAt: '2026-09-10T00:00:00Z' });
    const result = resolveContextKey(SUBJECT, 'x', [cc, vs]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) expect(result.winner.authorityClass).toBe('COMPUTED_CANONICAL');
  });

  it('resolves to VERIFIED_STATE over MODEL_INFERENCE', () => {
    const vs = makeItem({ contextKey: 'y', authorityClass: 'VERIFIED_STATE', value: 'Y' });
    const mi = makeItem({ contextKey: 'y', authorityClass: 'MODEL_INFERENCE', value: 'wrong' });
    const result = resolveContextKey(SUBJECT, 'y', [vs, mi]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) expect(result.winner.authorityClass).toBe('VERIFIED_STATE');
  });
});

// ---------------------------------------------------------------------------
// SECTION 2: MODEL_INFERENCE never overrides fact
// ---------------------------------------------------------------------------

describe('MODEL_INFERENCE cannot override non-inference sources', () => {
  it('Proof test B: MODEL_INFERENCE says relationship=X; VERIFIED_STATE says relationship=Y → Y wins', () => {
    const mi = makeItem({ contextKey: 'relationship.status', authorityClass: 'MODEL_INFERENCE', value: 'X' });
    const vs = makeItem({ contextKey: 'relationship.status', authorityClass: 'VERIFIED_STATE', value: 'Y' });
    const result = resolveContextKey(SUBJECT, 'relationship.status', [mi, vs]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) {
      expect(result.winner.value).toBe('Y');
      expect(result.winner.authorityClass).toBe('VERIFIED_STATE');
    }
  });

  it('MODEL_INFERENCE against USER_STATED: USER_STATED wins', () => {
    const mi = makeItem({ contextKey: 'user.goal', authorityClass: 'MODEL_INFERENCE', value: 'inferred' });
    const us = makeItem({ contextKey: 'user.goal', authorityClass: 'USER_STATED', value: 'stated' });
    const result = resolveContextKey(SUBJECT, 'user.goal', [mi, us]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) {
      expect(result.winner.authorityClass).toBe('USER_STATED');
    }
  });

  it('Two MODEL_INFERENCE items with the same value resolve to a winner', () => {
    const mi1 = makeItem({ contextKey: 'user.z', authorityClass: 'MODEL_INFERENCE', value: 'same', occurredAt: '2026-09-01T00:00:00Z' });
    const mi2 = makeItem({ contextKey: 'user.z', authorityClass: 'MODEL_INFERENCE', value: 'same', occurredAt: '2026-09-05T00:00:00Z' });
    const result = resolveContextKey(SUBJECT, 'user.z', [mi1, mi2]);
    expect('winner' in result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SECTION 3: RETRIEVED_MEMORY cannot override newer USER_STATED
// ---------------------------------------------------------------------------

describe('RETRIEVED_MEMORY vs USER_STATED', () => {
  it('Proof test A: old memory goal=A; newer USER_STATED goal=B → canonical = B', () => {
    const oldMem = makeItem({
      contextKey: 'user.currentGoal',
      authorityClass: 'RETRIEVED_MEMORY',
      value: 'A',
      occurredAt: '2026-08-01T00:00:00Z',
    });
    const newStated = makeItem({
      contextKey: 'user.currentGoal',
      authorityClass: 'USER_STATED',
      value: 'B',
      occurredAt: '2026-09-15T00:00:00Z',
    });
    const result = resolveContextKey(SUBJECT, 'user.currentGoal', [oldMem, newStated]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) {
      expect(result.winner.value).toBe('B');
      expect(result.winner.authorityClass).toBe('USER_STATED');
    }
  });

  it('Old USER_STATED + newer RETRIEVED_MEMORY → conflict or memory wins based on authority', () => {
    // RETRIEVED_MEMORY (4) vs USER_STATED (3) — USER_STATED has higher authority always
    const us = makeItem({
      contextKey: 'user.currentGoal',
      authorityClass: 'USER_STATED',
      value: 'A',
      occurredAt: '2026-08-01T00:00:00Z',
    });
    const mem = makeItem({
      contextKey: 'user.currentGoal',
      authorityClass: 'RETRIEVED_MEMORY',
      value: 'B',
      occurredAt: '2026-09-14T00:00:00Z',
    });
    // USER_STATED has higher authority regardless of time
    const result = resolveContextKey(SUBJECT, 'user.currentGoal', [us, mem]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) {
      expect(result.winner.authorityClass).toBe('USER_STATED');
    }
  });
});

// ---------------------------------------------------------------------------
// SECTION 4: Expired context excluded from active
// ---------------------------------------------------------------------------

describe('Expired context handling', () => {
  it('Expired item does not represent current context when active alternative exists', () => {
    const expired = makeItem({
      contextKey: 'protocol.status',
      authorityClass: 'VERIFIED_STATE',
      value: 'active',
      validUntil: '2026-08-01T00:00:00Z', // in the past
    });
    const current = makeItem({
      contextKey: 'protocol.status',
      authorityClass: 'VERIFIED_STATE',
      value: 'completed',
    });
    const result = resolveContextKey(SUBJECT, 'protocol.status', [expired, current]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) {
      expect(result.winner.value).toBe('completed');
      expect(result.winner.expired).toBe(false);
    }
  });

  it('buildContextItem sets expired=true when validUntil is in the past', () => {
    const item = makeItem({
      contextKey: 'test.key',
      authorityClass: 'VERIFIED_STATE',
      value: 'stale',
      validUntil: '2020-01-01T00:00:00Z',
    });
    expect(item.expired).toBe(true);
  });

  it('PersonalContextEngine places expired items in historicalContext, not activeContext', async () => {
    const expiredItem = makeItem({
      contextKey: 'protocol.status',
      authorityClass: 'VERIFIED_STATE',
      value: 'old-active',
      validUntil: '2020-01-01T00:00:00Z',
    });

    // Use adapter that injects expired item
    const adapter = {
      sourceName: 'MockExpiredAdapter',
      sourceType: 'SYSTEM' as const,
      buildContext: async () => [expiredItem],
    };

    const engine = new PersonalContextEngine(SUBJECT, [adapter]);
    const snapshot = await engine.build();

    expect(snapshot.activeContext.find(i => i.contextKey === 'protocol.status')).toBeUndefined();
    expect(snapshot.historicalContext.find(i => i.contextKey === 'protocol.status')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// SECTION 5: Unresolved conflicts preserved
// ---------------------------------------------------------------------------

describe('Unresolved conflict preservation', () => {
  it('Two VERIFIED_STATE items with different values → conflict preserved, no guess', () => {
    const vs1 = makeItem({
      contextKey: 'relationship.status',
      authorityClass: 'VERIFIED_STATE',
      value: 'partnered',
      occurredAt: '2026-09-01T00:00:00Z',
    });
    const vs2 = makeItem({
      contextKey: 'relationship.status',
      authorityClass: 'VERIFIED_STATE',
      value: 'single',
      occurredAt: '2026-09-01T00:00:00Z', // same time → no temporal tiebreak
    });
    const result = resolveContextKey(SUBJECT, 'relationship.status', [vs1, vs2]);
    expect('conflict' in result).toBe(true);
    if ('conflict' in result) {
      expect(result.conflict.candidates).toHaveLength(2);
      expect(result.conflict.reason).toContain('partnered');
      expect(result.conflict.reason).toContain('single');
    }
  });

  it('PersonalContextEngine records conflict in unresolvedConflicts, NOT activeContext', async () => {
    const vs1 = makeItem({ contextKey: 'conflict.key', authorityClass: 'VERIFIED_STATE', value: 'A', occurredAt: '2026-09-01T00:00:00Z' });
    const vs2 = makeItem({ contextKey: 'conflict.key', authorityClass: 'VERIFIED_STATE', value: 'B', occurredAt: '2026-09-01T00:00:00Z' });
    const adapter = {
      sourceName: 'MockConflictAdapter',
      sourceType: 'SYSTEM' as const,
      buildContext: async () => [vs1, vs2],
    };
    const engine = new PersonalContextEngine(SUBJECT, [adapter]);
    const snapshot = await engine.build();
    expect(snapshot.unresolvedConflicts).toHaveLength(1);
    expect(snapshot.activeContext.find(i => i.contextKey === 'conflict.key')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// SECTION 6: Profile allowlist
// ---------------------------------------------------------------------------

describe('Profile adapter allowlist', () => {
  it('Includes allowed fields', async () => {
    const input: ProfileContextInput = { name: 'Luna', birthDate: '1990-03-21', language: 'es' };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    const keys = items.map(i => i.contextKey);
    expect(keys).toContain('profile.name');
    expect(keys).toContain('profile.birthDate');
    expect(keys).toContain('profile.language');
  });

  it('Excludes guardian_notes (not in allowlist)', async () => {
    // guardian_notes is intentionally excluded from ProfileContextInput type
    const input = {
      name: 'Luna',
      guardian_notes: 'AI generated note', // extra field not in allowlist
    };
    const adapter = new ProfileContextAdapter(input as Parameters<typeof ProfileContextAdapter.prototype.buildContext>[0] extends unknown ? typeof input : never);
    const items = await adapter.buildContext(SUBJECT);
    const keys = items.map(i => i.contextKey);
    expect(keys).not.toContain('profile.guardian_notes');
  });

  it('Skips null/empty values silently', async () => {
    const input: ProfileContextInput = { name: '', birthDate: null };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    expect(items).toHaveLength(0);
  });

  it('All items have COMPUTED_CANONICAL authority', async () => {
    const input: ProfileContextInput = { name: 'Luna', birthDate: '1990-03-21' };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    items.forEach(i => expect(i.authorityClass).toBe('COMPUTED_CANONICAL'));
  });

  it('All items have LONG_TERM freshness', async () => {
    const input: ProfileContextInput = { name: 'Luna', birthDate: '1990-03-21' };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    items.forEach(i => expect(i.freshness).toBe('LONG_TERM'));
  });
});

// ---------------------------------------------------------------------------
// SECTION 7: Protocol normalization
// ---------------------------------------------------------------------------

describe('Protocol context adapter', () => {
  it('Active protocol produces CURRENT freshness VERIFIED_STATE items', async () => {
    const input: ProtocolContextInput = {
      protocolId: 'proto-001',
      status: 'active',
      intention: 'Build discipline',
      currentDay: 13,
      targetDays: 21,
      latestCheckInRef: 'log-xyz',
      latestCheckInLocalDate: '2026-09-16',
    };
    const adapter = new ProtocolContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    const statusItem = items.find(i => i.contextKey === 'protocol.status');
    expect(statusItem).toBeDefined();
    expect(statusItem!.freshness).toBe('CURRENT');
    expect(statusItem!.authorityClass).toBe('VERIFIED_STATE');
    expect(statusItem!.value).toBe('active');
  });

  it('Intention item is USER_STATED, not VERIFIED_STATE', async () => {
    const input: ProtocolContextInput = {
      protocolId: 'proto-001',
      status: 'active',
      intention: 'My intention',
      currentDay: 5,
      targetDays: 21,
    };
    const adapter = new ProtocolContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    const intentionItem = items.find(i => i.contextKey === 'protocol.intention');
    expect(intentionItem).toBeDefined();
    expect(intentionItem!.authorityClass).toBe('USER_STATED');
  });

  it('Completed protocol produces HISTORICAL freshness', async () => {
    const input: ProtocolContextInput = {
      protocolId: 'proto-002',
      status: 'completed',
      currentDay: 21,
      targetDays: 21,
    };
    const adapter = new ProtocolContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    items.forEach(i => expect(i.freshness).toBe('HISTORICAL'));
  });

  it('Null input returns empty array', async () => {
    const adapter = new ProtocolContextAdapter(null);
    const items = await adapter.buildContext(SUBJECT);
    expect(items).toHaveLength(0);
  });

  it('Does not contain any AI-inferred fields', async () => {
    const input: ProtocolContextInput = { protocolId: 'p', status: 'active', currentDay: 1, targetDays: 21 };
    const adapter = new ProtocolContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    items.forEach(i => {
      expect(i.authorityClass).not.toBe('MODEL_INFERENCE');
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 8: Coherence normalization
// ---------------------------------------------------------------------------

describe('Coherence context adapter', () => {
  it('Produces VERIFIED_STATE CURRENT items', async () => {
    const input: CoherenceContextInput = { global_coherence: 70, current_streak: 5 };
    const adapter = new CoherenceContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    items.forEach(i => {
      expect(i.authorityClass).toBe('VERIFIED_STATE');
      expect(i.freshness).toBe('CURRENT');
    });
  });

  it('Maps score 75+ to HIGH', async () => {
    const input: CoherenceContextInput = { global_coherence: 80, current_streak: 3 };
    const adapter = new CoherenceContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    const levelItem = items.find(i => i.contextKey === 'coherence.level');
    expect(levelItem!.value).toBe('HIGH');
  });

  it('Maps score <45 to LOW', async () => {
    const input: CoherenceContextInput = { global_coherence: 40, current_streak: 0 };
    const adapter = new CoherenceContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    const levelItem = items.find(i => i.contextKey === 'coherence.level');
    expect(levelItem!.value).toBe('LOW');
  });

  it('Null input returns empty array', async () => {
    const adapter = new CoherenceContextAdapter(null);
    const items = await adapter.buildContext(SUBJECT);
    expect(items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// SECTION 9: Memory adapter — unavailable is non-fatal
// ---------------------------------------------------------------------------

describe('Memory context adapter availability', () => {
  it('When unavailable, buildContext returns empty array (non-fatal)', async () => {
    const adapter = new MemoryContextAdapter({ available: false, reason: 'naos_memory table not applied' });
    const items = await adapter.buildContext(SUBJECT);
    expect(items).toHaveLength(0);
  });

  it('When unavailable, getUnavailableSource returns descriptor', () => {
    const adapter = new MemoryContextAdapter({ available: false, reason: 'naos_memory table not applied' });
    const src = adapter.getUnavailableSource();
    expect(src).not.toBeNull();
    expect(src!.sourceType).toBe('MEMORY_STORE');
  });

  it('PersonalContextEngine records unavailable memory in unavailableSources', async () => {
    const memAdapter = new MemoryContextAdapter({ available: false, reason: 'DB not migrated' });
    const engine = new PersonalContextEngine(SUBJECT, [memAdapter]);
    const snapshot = await engine.build();
    expect(snapshot.unavailableSources).toHaveLength(1);
    expect(snapshot.unavailableSources[0].sourceType).toBe('MEMORY_STORE');
  });

  it('Available memory: AI importance stored as metadata, not authority', async () => {
    const adapter = new MemoryContextAdapter({
      available: true,
      memories: [{
        id: 'mem-001',
        content: 'User likes mornings',
        memory_type: 'memory',
        module_source: 'sigil',
        importance: 9, // AI score — must NOT influence authority
        created_at: '2026-09-01T00:00:00Z',
      }],
    });
    const items = await adapter.buildContext(SUBJECT);
    expect(items).toHaveLength(1);
    expect(items[0].authorityClass).toBe('RETRIEVED_MEMORY');
    // importance must NOT appear in top-level fields
    expect((items[0] as any).importance).toBeUndefined();
    // structured payload stores it clearly labelled as legacy metadata
    expect(items[0].structuredPayload?.['legacy_ai_importance_metadata']).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// SECTION 10: Deterministic IDs
// ---------------------------------------------------------------------------

describe('Deterministic persisted-source IDs', () => {
  it('Same inputs always produce the same ID', () => {
    const id1 = buildDeterministicId('user-abc', 'PROFILE', 'birthDate', 'profile.birthDate');
    const id2 = buildDeterministicId('user-abc', 'PROFILE', 'birthDate', 'profile.birthDate');
    expect(id1).toBe(id2);
  });

  it('Different accountIds produce different IDs', () => {
    const id1 = buildDeterministicId('user-1', 'PROFILE', 'birthDate', 'profile.birthDate');
    const id2 = buildDeterministicId('user-2', 'PROFILE', 'birthDate', 'profile.birthDate');
    expect(id1).not.toBe(id2);
  });

  it('Ephemeral IDs are prefixed with EPHEMERAL_', () => {
    const id = buildEphemeralId('user.currentGoal', 0);
    expect(id.startsWith('EPHEMERAL_')).toBe(true);
  });

  it('Persisted IDs are prefixed with pc:', () => {
    const id = buildDeterministicId('user-abc', 'PROTOCOL', 'proto-001', 'protocol.status');
    expect(id.startsWith('pc:')).toBe(true);
  });

  it('Profile adapter IDs are deterministic across calls', async () => {
    const input: ProfileContextInput = { name: 'Luna', birthDate: '1990-03-21' };
    const adapter = new ProfileContextAdapter(input);
    const items1 = await adapter.buildContext(SUBJECT);
    const items2 = await adapter.buildContext(SUBJECT);
    const ids1 = items1.map(i => i.id).sort();
    const ids2 = items2.map(i => i.id).sort();
    expect(ids1).toEqual(ids2);
  });
});

// ---------------------------------------------------------------------------
// SECTION 11: ACCOUNT_OWNER subject isolation
// ---------------------------------------------------------------------------

describe('ACCOUNT_OWNER subject', () => {
  it('Subject class is always ACCOUNT_OWNER', () => {
    expect(SUBJECT.subjectClass).toBe('ACCOUNT_OWNER');
  });

  it('Profile items carry the subject through', async () => {
    const input: ProfileContextInput = { name: 'Luna' };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    items.forEach(i => {
      expect(i.subject.subjectClass).toBe('ACCOUNT_OWNER');
      expect(i.subject.accountId).toBe(SUBJECT.accountId);
    });
  });

  it('Two different subjects produce different item IDs for same contextKey', async () => {
    const subjectA: PersonalContextSubject = { accountId: 'user-A', subjectClass: 'ACCOUNT_OWNER' };
    const subjectB: PersonalContextSubject = { accountId: 'user-B', subjectClass: 'ACCOUNT_OWNER' };
    const adapterA = new ProfileContextAdapter({ name: 'Alice' });
    const adapterB = new ProfileContextAdapter({ name: 'Alice' });
    const [itemsA, itemsB] = await Promise.all([adapterA.buildContext(subjectA), adapterB.buildContext(subjectB)]);
    expect(itemsA[0].id).not.toBe(itemsB[0].id);
  });
});

// ---------------------------------------------------------------------------
// SECTION 12: No domain fields, no scores
// ---------------------------------------------------------------------------

describe('No domain, score, or convergence fields in snapshot', () => {
  it('PersonalContextSnapshot has no domain, score, convergence, or recommendation fields', async () => {
    const engine = new PersonalContextEngine(SUBJECT, []);
    const snapshot = await engine.build();
    expect((snapshot as any).domains).toBeUndefined();
    expect((snapshot as any).score).toBeUndefined();
    expect((snapshot as any).signalStrength).toBeUndefined();
    expect((snapshot as any).convergence).toBeUndefined();
    expect((snapshot as any).recommendations).toBeUndefined();
  });

  it('PersonalContextItem has no domain or score fields', () => {
    const item = makeItem({ contextKey: 'x', authorityClass: 'VERIFIED_STATE', value: 'v' });
    expect((item as any).domain).toBeUndefined();
    expect((item as any).score).toBeUndefined();
    expect((item as any).signalStrength).toBeUndefined();
    expect((item as any).confidence).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// SECTION 13: User-Stated adapter — no AI extraction
// ---------------------------------------------------------------------------

describe('UserStatedContextAdapter', () => {
  it('Returns USER_STATED items without any AI extraction', async () => {
    const facts: UserStatedFact[] = [
      { contextKey: 'user.todayEvent', value: 'I have a meeting tomorrow.', statedAt: NOW },
      { contextKey: 'user.currentGoal', value: 'My goal is discipline.', statedAt: NOW },
    ];
    const adapter = new UserStatedContextAdapter(facts);
    const items = await adapter.buildContext(SUBJECT);
    expect(items).toHaveLength(2);
    items.forEach(i => {
      expect(i.authorityClass).toBe('USER_STATED');
      expect(i.freshness).toBe('CURRENT');
      expect(i.id.startsWith('EPHEMERAL_')).toBe(true);
    });
  });

  it('Values are verbatim — no transformation', async () => {
    const verbatim = 'I changed jobs last week';
    const facts: UserStatedFact[] = [{ contextKey: 'user.jobChange', value: verbatim, statedAt: NOW }];
    const adapter = new UserStatedContextAdapter(facts);
    const items = await adapter.buildContext(SUBJECT);
    expect(items[0].value).toBe(verbatim);
  });
});

// ---------------------------------------------------------------------------
// SECTION 14: Snapshot structure and full integration
// ---------------------------------------------------------------------------

describe('PersonalContextEngine — full integration', () => {
  it('Produces a valid snapshot with all required fields', async () => {
    const profileAdapter = new ProfileContextAdapter({ name: 'Test', birthDate: '1992-01-01', language: 'es' });
    const coherenceAdapter = new CoherenceContextAdapter({ global_coherence: 60, current_streak: 2 });
    const memAdapter = new MemoryContextAdapter({ available: false, reason: 'not applied' });
    const engine = new PersonalContextEngine(SUBJECT, [profileAdapter, coherenceAdapter, memAdapter]);
    const snapshot = await engine.build();

    expect(snapshot.subject.subjectClass).toBe('ACCOUNT_OWNER');
    expect(snapshot.generatedAt).toBeTruthy();
    expect(Array.isArray(snapshot.activeContext)).toBe(true);
    expect(Array.isArray(snapshot.historicalContext)).toBe(true);
    expect(Array.isArray(snapshot.unresolvedConflicts)).toBe(true);
    expect(Array.isArray(snapshot.unavailableSources)).toBe(true);
    expect(snapshot.unavailableSources[0].sourceType).toBe('MEMORY_STORE');
  });

  it('Adapter failure is non-fatal — other adapters still produce results', async () => {
    const goodAdapter = new ProfileContextAdapter({ name: 'Luna' });
    const badAdapter = {
      sourceName: 'BadAdapter',
      sourceType: 'SYSTEM' as const,
      buildContext: async (): Promise<PersonalContextItem[]> => { throw new Error('DB exploded'); },
    };
    const engine = new PersonalContextEngine(SUBJECT, [goodAdapter, badAdapter]);
    const snapshot = await engine.build();
    expect(snapshot.activeContext.length).toBeGreaterThan(0); // profile items present
    expect(snapshot.unavailableSources.some(u => u.reason.includes('DB exploded'))).toBe(true);
  });
});
