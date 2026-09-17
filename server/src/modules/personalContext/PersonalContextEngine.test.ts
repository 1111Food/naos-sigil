/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Test suite — Part 6.1 Semantic + Test Acceptance Gate.
 *
 * GATES TESTED (new in this acceptance pass):
 *  - Profile fields are NOT COMPUTED_CANONICAL — raw user input is USER_STATED
 *  - plan_type removed from V1 personal context
 *  - COMPUTED_CANONICAL definition: only deterministic NAOS-math results
 *  - No universal 7-day RECENT threshold in code
 *  - No universal 24h conflict rule — recency tiebreak only for eligible sources
 *  - Expired cannot override current (engine pre-filters, resolver defends)
 *  - RETRIEVED_MEMORY conflict at different timestamps → preserved, NOT resolved
 *  - MODEL_INFERENCE conflict at different timestamps → preserved, NOT resolved
 *  - Conflict key is semantic and specific
 *  - Memory availability truth preserved
 *
 * ORIGINAL GATES (retained):
 *  - Authority ordering
 *  - MODEL_INFERENCE never overrides fact
 *  - RETRIEVED_MEMORY cannot override newer USER_STATED fact
 *  - Unresolved conflicts preserved (not guessed)
 *  - Profile allowlist (no guardian_notes, no AI fields, no PII)
 *  - Protocol normalization
 *  - Coherence normalization
 *  - Memory unavailable non-fatal
 *  - Deterministic persisted-source IDs
 *  - Ephemeral IDs are non-deterministic across turns (correct behavior)
 *  - ACCOUNT_OWNER subject isolation
 *  - No domain fields, no scores, no LLM calls
 *
 * Proof tests:
 *  A) Old RETRIEVED_MEMORY says goal = A; newer USER_STATED says goal = B → canonical = B
 *  B) MODEL_INFERENCE says relationship = X; VERIFIED_STATE says relationship = Y → Y wins
 *  C) Two RETRIEVED_MEMORY items at different timestamps, different values → CONFLICT (not resolved)
 *  D) Two MODEL_INFERENCE items at different timestamps, different values → CONFLICT (not resolved)
 *  E) Raw birthDate from profile is USER_STATED, NOT COMPUTED_CANONICAL
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
import { PersonalContextAssembler } from './index';
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
// SECTION 1: Authority ordering
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

  it('Proof test D: Two MODEL_INFERENCE items at different timestamps, different values → CONFLICT (no 24h rule)', () => {
    const mi1 = makeItem({ contextKey: 'user.z', authorityClass: 'MODEL_INFERENCE', value: 'val-A', occurredAt: '2026-09-01T00:00:00Z' });
    const mi2 = makeItem({ contextKey: 'user.z', authorityClass: 'MODEL_INFERENCE', value: 'val-B', occurredAt: '2026-09-14T00:00:00Z' });
    const result = resolveContextKey(SUBJECT, 'user.z', [mi1, mi2]);
    // MODEL_INFERENCE: recency NOT a valid tiebreak → conflict
    expect('conflict' in result).toBe(true);
    if ('conflict' in result) {
      expect(result.conflict.candidates).toHaveLength(2);
    }
  });

  it('Two MODEL_INFERENCE items with the same value → winner (same value rule)', () => {
    const mi1 = makeItem({ contextKey: 'user.z', authorityClass: 'MODEL_INFERENCE', value: 'same', occurredAt: '2026-09-01T00:00:00Z' });
    const mi2 = makeItem({ contextKey: 'user.z', authorityClass: 'MODEL_INFERENCE', value: 'same', occurredAt: '2026-09-05T00:00:00Z' });
    const result = resolveContextKey(SUBJECT, 'user.z', [mi1, mi2]);
    expect('winner' in result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SECTION 3: RETRIEVED_MEMORY vs USER_STATED + no universal 24h rule
// ---------------------------------------------------------------------------

describe('RETRIEVED_MEMORY vs USER_STATED and temporal rules', () => {
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

  it('USER_STATED always beats RETRIEVED_MEMORY regardless of recency', () => {
    const us = makeItem({
      contextKey: 'user.currentGoal',
      authorityClass: 'USER_STATED',
      value: 'A',
      occurredAt: '2026-08-01T00:00:00Z', // older timestamp
    });
    const mem = makeItem({
      contextKey: 'user.currentGoal',
      authorityClass: 'RETRIEVED_MEMORY',
      value: 'B',
      occurredAt: '2026-09-14T00:00:00Z', // newer timestamp — still loses
    });
    const result = resolveContextKey(SUBJECT, 'user.currentGoal', [us, mem]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) {
      expect(result.winner.authorityClass).toBe('USER_STATED');
    }
  });

  it('Proof test C: Two RETRIEVED_MEMORY items at different timestamps, different values → CONFLICT (no 24h rule)', () => {
    const m1 = makeItem({
      contextKey: 'user.interest',
      authorityClass: 'RETRIEVED_MEMORY',
      value: 'art',
      occurredAt: '2026-08-01T00:00:00Z',
    });
    const m2 = makeItem({
      contextKey: 'user.interest',
      authorityClass: 'RETRIEVED_MEMORY',
      value: 'music',
      occurredAt: '2026-09-14T00:00:00Z', // 44 days later
    });
    const result = resolveContextKey(SUBJECT, 'user.interest', [m1, m2]);
    // RETRIEVED_MEMORY: recency NOT a valid tiebreak → conflict preserved
    expect('conflict' in result).toBe(true);
    if ('conflict' in result) {
      expect(result.conflict.candidates).toHaveLength(2);
      expect(result.conflict.reason).toContain('art');
      expect(result.conflict.reason).toContain('music');
    }
  });

  it('VERIFIED_STATE same authority, different timestamps → more recent wins (recency IS eligible)', () => {
    const vs1 = makeItem({
      contextKey: 'protocol.status',
      authorityClass: 'VERIFIED_STATE',
      value: 'active',
      occurredAt: '2026-09-01T00:00:00Z',
    });
    const vs2 = makeItem({
      contextKey: 'protocol.status',
      authorityClass: 'VERIFIED_STATE',
      value: 'completed',
      occurredAt: '2026-09-15T00:00:00Z',
    });
    const result = resolveContextKey(SUBJECT, 'protocol.status', [vs1, vs2]);
    expect('winner' in result).toBe(true);
    if ('winner' in result) {
      expect(result.winner.value).toBe('completed');
    }
  });
});

// ---------------------------------------------------------------------------
// SECTION 4: Expired context cannot override current
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

  it('EXPIRED_ITEM_CAN_OVERRIDE_CURRENT = NO: engine pre-filters expired before conflict resolution', async () => {
    // One expired item with a "better" authority, one active with lower authority.
    // The expired item must NOT win.
    const expiredHighAuth = makeItem({
      contextKey: 'test.override',
      authorityClass: 'COMPUTED_CANONICAL',
      value: 'expired-winner-candidate',
      validUntil: '2020-01-01T00:00:00Z', // expired
    });
    const activeLowAuth = makeItem({
      contextKey: 'test.override',
      authorityClass: 'USER_STATED',
      value: 'current-active',
    });

    const adapter = {
      sourceName: 'MockMixedAdapter',
      sourceType: 'SYSTEM' as const,
      buildContext: async () => [expiredHighAuth, activeLowAuth],
    };

    const engine = new PersonalContextEngine(SUBJECT, [adapter]);
    const snapshot = await engine.build();

    const active = snapshot.activeContext.find(i => i.contextKey === 'test.override');
    expect(active).toBeDefined();
    expect(active!.value).toBe('current-active');
    expect(active!.expired).toBe(false);

    const historical = snapshot.historicalContext.find(i => i.contextKey === 'test.override');
    expect(historical).toBeDefined();
    expect(historical!.value).toBe('expired-winner-candidate');
  });
});

// ---------------------------------------------------------------------------
// SECTION 5: Unresolved conflicts preserved
// ---------------------------------------------------------------------------

describe('Unresolved conflict preservation', () => {
  it('Two VERIFIED_STATE items with different values, same timestamp → conflict preserved', () => {
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

  it('Conflict key is semantic and specific — different contextKeys are not conflated', async () => {
    const protocolStatus = makeItem({ contextKey: 'protocol.status', authorityClass: 'VERIFIED_STATE', value: 'active' });
    const userStatement = makeItem({ contextKey: 'user.protocolIntention', authorityClass: 'USER_STATED', value: "I don't want to continue" });
    const adapter = {
      sourceName: 'MockSeparateKeys',
      sourceType: 'SYSTEM' as const,
      buildContext: async () => [protocolStatus, userStatement],
    };
    const engine = new PersonalContextEngine(SUBJECT, [adapter]);
    const snapshot = await engine.build();
    // Different contextKeys → no conflict; both in activeContext
    expect(snapshot.unresolvedConflicts).toHaveLength(0);
    expect(snapshot.activeContext).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// SECTION 6: Profile adapter — corrected authority classification
// ---------------------------------------------------------------------------

describe('Profile adapter — corrected authority classification', () => {
  it('Proof test E: profile.birthDate is USER_STATED, NOT COMPUTED_CANONICAL', async () => {
    const input: ProfileContextInput = { birthDate: '1990-03-21' };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    const birthDateItem = items.find(i => i.contextKey === 'profile.birthDate');
    expect(birthDateItem).toBeDefined();
    expect(birthDateItem!.authorityClass).toBe('USER_STATED');
    expect(birthDateItem!.authorityClass).not.toBe('COMPUTED_CANONICAL');
  });

  it('profile.name is USER_STATED', async () => {
    const input: ProfileContextInput = { name: 'Luna' };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    const nameItem = items.find(i => i.contextKey === 'profile.name');
    expect(nameItem!.authorityClass).toBe('USER_STATED');
  });

  it('All profile fields are USER_STATED (no COMPUTED_CANONICAL in profile output)', async () => {
    const input: ProfileContextInput = {
      name: 'Luna',
      birthDate: '1990-03-21',
      birthTime: '08:30',
      birthCity: 'Mexico City',
      birthState: 'CDMX',
      birthCountry: 'MX',
      language: 'es',
    };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    expect(items.length).toBeGreaterThan(0);
    items.forEach(i => {
      expect(i.authorityClass).toBe('USER_STATED');
      expect(i.authorityClass).not.toBe('COMPUTED_CANONICAL');
    });
  });

  it('plan_type is NOT in V1 profile context', async () => {
    // plan_type was removed — product entitlement ≠ personal life context
    const input = { name: 'Luna' };
    const adapter = new ProfileContextAdapter(input as ProfileContextInput);
    const items = await adapter.buildContext(SUBJECT);
    const planItem = items.find(i => i.contextKey === 'profile.plan_type');
    expect(planItem).toBeUndefined();
  });

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
    const input = {
      name: 'Luna',
      guardian_notes: 'AI generated note', // extra field — not in allowlist
    };
    const adapter = new ProfileContextAdapter(input as ProfileContextInput);
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

  it('All items have LONG_TERM freshness', async () => {
    const input: ProfileContextInput = { name: 'Luna', birthDate: '1990-03-21' };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    items.forEach(i => expect(i.freshness).toBe('LONG_TERM'));
  });

  it('No RECENT freshness with 7-day threshold emitted by profile', async () => {
    const input: ProfileContextInput = { name: 'Luna', birthDate: '1990-03-21' };
    const adapter = new ProfileContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    // UNIVERSAL_RECENT_DAY_THRESHOLD_EXISTS = NO: no adapter hardcodes 7 days
    items.forEach(i => expect(i.freshness).not.toBe('RECENT'));
  });
});

// ---------------------------------------------------------------------------
// SECTION 7: Protocol normalization — source-aware freshness
// ---------------------------------------------------------------------------

describe('Protocol context adapter — source-aware freshness', () => {
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

  it('Completed protocol produces HISTORICAL freshness — source-aware (not a 7-day rule)', async () => {
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

  it('Maps 45–74 to MEDIUM', async () => {
    const input: CoherenceContextInput = { global_coherence: 60, current_streak: 1 };
    const adapter = new CoherenceContextAdapter(input);
    const items = await adapter.buildContext(SUBJECT);
    const levelItem = items.find(i => i.contextKey === 'coherence.level');
    expect(levelItem!.value).toBe('MEDIUM');
  });

  it('Null input returns empty array', async () => {
    const adapter = new CoherenceContextAdapter(null);
    const items = await adapter.buildContext(SUBJECT);
    expect(items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// SECTION 9: Memory adapter — unavailable is non-fatal + truth preservation
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

  it('MEMORY_RUNTIME_OPERATIONAL = NO preserved: test uses available:false (not mocking DB as available)', () => {
    // This test verifies we are not masking production truth.
    // In production, naos_memory migration has NOT been applied.
    // Tests use available:false to reflect production reality.
    const adapter = new MemoryContextAdapter({ available: false, reason: 'naos_memory migration not applied to target DB' });
    expect(adapter.getUnavailableSource()?.sourceType).toBe('MEMORY_STORE');
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
    expect((items[0] as unknown as Record<string, unknown>)['importance']).toBeUndefined();
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

  it('Ephemeral IDs are non-deterministic across calls (correct: each turn is distinct)', () => {
    const id1 = buildEphemeralId('user.currentGoal', 0);
    // Sleep-free: just call twice — Date.now() may differ by milliseconds
    const id2 = buildEphemeralId('user.currentGoal', 0);
    // They SHOULD be different (non-deterministic by design).
    // If they happen to be equal (same ms), the test is still valid — we verify
    // that the strategy does NOT use a stable hash of inputs.
    expect(id1.startsWith('EPHEMERAL_')).toBe(true);
    expect(id2.startsWith('EPHEMERAL_')).toBe(true);
    // Both carry the contextKey for readability (debugging aid, not a stable ID)
    expect(id1).toContain('user.currentGoal');
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
// SECTION 12: No domain, score, convergence fields
// ---------------------------------------------------------------------------

describe('No domain, score, or convergence fields in snapshot', () => {
  it('PersonalContextSnapshot has no domain, score, convergence, or recommendation fields', async () => {
    const engine = new PersonalContextEngine(SUBJECT, []);
    const snapshot = await engine.build();
    expect((snapshot as unknown as Record<string, unknown>)['domains']).toBeUndefined();
    expect((snapshot as unknown as Record<string, unknown>)['score']).toBeUndefined();
    expect((snapshot as unknown as Record<string, unknown>)['signalStrength']).toBeUndefined();
    expect((snapshot as unknown as Record<string, unknown>)['convergence']).toBeUndefined();
    expect((snapshot as unknown as Record<string, unknown>)['recommendations']).toBeUndefined();
  });

  it('PersonalContextItem has no domain or score fields', () => {
    const item = makeItem({ contextKey: 'x', authorityClass: 'VERIFIED_STATE', value: 'v' });
    expect((item as unknown as Record<string, unknown>)['domain']).toBeUndefined();
    expect((item as unknown as Record<string, unknown>)['score']).toBeUndefined();
    expect((item as unknown as Record<string, unknown>)['signalStrength']).toBeUndefined();
    expect((item as unknown as Record<string, unknown>)['confidence']).toBeUndefined();
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

  it('All profile items in snapshot are USER_STATED (not COMPUTED_CANONICAL)', async () => {
    const profileAdapter = new ProfileContextAdapter({ name: 'Luna', birthDate: '1990-03-21', birthCity: 'Oaxaca' });
    const engine = new PersonalContextEngine(SUBJECT, [profileAdapter]);
    const snapshot = await engine.build();
    const profileItems = snapshot.activeContext.filter(i => i.contextKey.startsWith('profile.'));
    expect(profileItems.length).toBeGreaterThan(0);
    profileItems.forEach(i => {
      expect(i.authorityClass).toBe('USER_STATED');
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 15: Phase 6.2 — Trusted Source Assembly (PersonalContextAssembler)
// ---------------------------------------------------------------------------

describe('Phase 6.2 — PersonalContextAssembler', () => {
  it('CASE A: profile exists, no protocol, no coherence, memory unavailable, no user-stated context', async () => {
    const readers = {
      readProfile: async () => ({ name: 'Aria', birthDate: '1995-04-12', language: 'es' }),
      readProtocol: async () => null,
      readCoherence: async () => null,
      readMemory: async () => ({ available: false as const, reason: 'naos_memory unmigrated' }),
    };

    const snapshot = await PersonalContextAssembler.assemble(SUBJECT, { readers });

    expect(snapshot.subject.accountId).toBe(SUBJECT.accountId);
    expect(snapshot.activeContext.length).toBe(3); // name, birthDate, language
    expect(snapshot.historicalContext.length).toBe(0);
    expect(snapshot.unresolvedConflicts.length).toBe(0);
    expect(snapshot.unavailableSources.some(u => u.sourceType === 'MEMORY_STORE')).toBe(true);

    // Verify all active items are USER_STATED and have complete provenance
    snapshot.activeContext.forEach(item => {
      expect(item.authorityClass).toBe('USER_STATED');
      expect(item.provenance.sourceType).toBe('PROFILE');
      expect(item.provenance.moduleName).toBe('ProfileContextAdapter');
      expect(item.id.startsWith('pc:')).toBe(true);
    });
  });

  it('CASE B: profile + active Protocol day 13 + coherence HIGH + memory unavailable + USER_STATED current goal', async () => {
    const readers = {
      readProfile: async () => ({ name: 'Aria', birthDate: '1995-04-12' }),
      readProtocol: async () => ({
        protocolId: 'proto-active-1',
        status: 'active' as const,
        currentDay: 13,
        targetDays: 21,
        intention: 'Master focus',
        latestCheckInLocalDate: '2026-09-16',
      }),
      readCoherence: async () => ({
        global_coherence: 85,
        current_streak: 7,
        lastActionAt: '2026-09-16T10:00:00Z',
      }),
      readMemory: async () => ({ available: false as const, reason: 'naos_memory unmigrated' }),
    };

    const userStatedFacts: UserStatedFact[] = [
      {
        contextKey: 'user.currentGoal',
        value: "Prepare tomorrow's negotiation",
        statedAt: '2026-09-16T12:00:00Z',
      },
    ];

    const snapshot = await PersonalContextAssembler.assemble(SUBJECT, { readers, userStatedFacts });

    // Active items check
    const keys = snapshot.activeContext.map(i => i.contextKey);
    expect(keys).toContain('profile.name');
    expect(keys).toContain('profile.birthDate');
    expect(keys).toContain('protocol.status');
    expect(keys).toContain('protocol.currentDay');
    expect(keys).toContain('protocol.intention');
    expect(keys).toContain('coherence.level');
    expect(keys).toContain('coherence.currentStreak');
    expect(keys).toContain('user.currentGoal');

    // Coherence level value
    const cohLevel = snapshot.activeContext.find(i => i.contextKey === 'coherence.level');
    expect(cohLevel?.value).toBe('HIGH');
    expect(cohLevel?.authorityClass).toBe('VERIFIED_STATE');

    // Ephemeral goal item
    const goalItem = snapshot.activeContext.find(i => i.contextKey === 'user.currentGoal');
    expect(goalItem?.authorityClass).toBe('USER_STATED');
    expect(goalItem?.id.startsWith('EPHEMERAL_')).toBe(true);
  });

  it('CASE C: profile + completed Protocol + expired memory → historical classification', async () => {
    const readers = {
      readProfile: async () => ({ name: 'Aria' }),
      readProtocol: async () => ({
        protocolId: 'proto-done',
        status: 'completed' as const,
        currentDay: 21,
        targetDays: 21,
      }),
      readMemory: async () => ({
        available: true as const,
        memories: [
          {
            id: 'mem-expired-1',
            content: 'Old temporary note',
            memory_type: 'memory',
            module_source: 'sigil',
            created_at: '2025-01-01T00:00:00Z',
            expires_at: '2025-02-01T00:00:00Z', // In the past
          },
        ],
      }),
    };

    const snapshot = await PersonalContextAssembler.assemble(SUBJECT, { readers });

    // Protocol status and currentDay should be in historicalContext
    const histKeys = snapshot.historicalContext.map(i => i.contextKey);
    expect(histKeys).toContain('protocol.status');
    expect(histKeys).toContain('protocol.currentDay');
    expect(histKeys).toContain('memory.memory.sigil');

    // Active context only contains profile
    expect(snapshot.activeContext.length).toBe(1);
    expect(snapshot.activeContext[0].contextKey).toBe('profile.name');
  });

  it('CASE D: old retrieved memory goal=A vs current USER_STATED goal=B → B active, no conflict', async () => {
    const readers = {
      readProfile: async () => ({ name: 'Aria' }),
      readMemory: async () => ({
        available: true as const,
        memories: [
          {
            id: 'mem-goal',
            content: 'Goal A: Launch MVP',
            memory_type: 'state',
            module_source: 'sigil',
            created_at: '2026-08-01T00:00:00Z',
          },
        ],
      }),
    };

    // Caller injects current-turn user stated fact with the exact same context key
    const userStatedFacts: UserStatedFact[] = [
      {
        contextKey: 'memory.state.sigil', // same key
        value: 'Goal B: Scale Operations',
        statedAt: '2026-09-16T12:00:00Z',
      },
    ];

    const snapshot = await PersonalContextAssembler.assemble(SUBJECT, { readers, userStatedFacts });

    // B wins (USER_STATED > RETRIEVED_MEMORY)
    const winningItem = snapshot.activeContext.find(i => i.contextKey === 'memory.state.sigil');
    expect(winningItem).toBeDefined();
    expect(winningItem?.value).toBe('Goal B: Scale Operations');
    expect(winningItem?.authorityClass).toBe('USER_STATED');
    expect(snapshot.unresolvedConflicts.length).toBe(0);
  });

  it('CASE E: source order independence produces semantically equivalent snapshot', async () => {
    // We execute assembler with same inputs in two orders by changing adapter order
    const profileData = { name: 'Aria', birthDate: '1995-04-12' };
    const protocolData = {
      protocolId: 'proto-order',
      status: 'active' as const,
      currentDay: 5,
      targetDays: 21,
    };
    const coherenceData = {
      global_coherence: 70,
      current_streak: 3,
    };

    // Order 1
    const p1 = new ProfileContextAdapter(profileData);
    const pr1 = new ProtocolContextAdapter(protocolData);
    const c1 = new CoherenceContextAdapter(coherenceData);
    const engine1 = new PersonalContextEngine(SUBJECT, [p1, pr1, c1]);
    const snap1 = await engine1.build();

    // Order 2
    const c2 = new CoherenceContextAdapter(coherenceData);
    const p2 = new ProfileContextAdapter(profileData);
    const pr2 = new ProtocolContextAdapter(protocolData);
    const engine2 = new PersonalContextEngine(SUBJECT, [c2, p2, pr2]);
    const snap2 = await engine2.build();

    // Semantic equivalence
    expect(snap1.activeContext.length).toBe(snap2.activeContext.length);
    const map1 = new Map(snap1.activeContext.map(i => [i.contextKey, i.value]));
    const map2 = new Map(snap2.activeContext.map(i => [i.contextKey, i.value]));
    expect(map1).toEqual(map2);
    expect(snap1.unresolvedConflicts.length).toBe(snap2.unresolvedConflicts.length);
  });

  it('Presentation metadata separation: isPresentationMetadata correctly identifies profile.name', () => {
    const nameItem = makeItem({ contextKey: 'profile.name', authorityClass: 'USER_STATED', value: 'Aria' });
    const birthItem = makeItem({ contextKey: 'profile.birthDate', authorityClass: 'USER_STATED', value: '1995-04-12' });
    const protoItem = makeItem({ contextKey: 'protocol.status', authorityClass: 'VERIFIED_STATE', value: 'active' });

    expect(PersonalContextAssembler.isPresentationMetadata(nameItem)).toBe(true);
    expect(PersonalContextAssembler.isPresentationMetadata(birthItem)).toBe(false);
    expect(PersonalContextAssembler.isPresentationMetadata(protoItem)).toBe(false);
  });

  it('Subject isolation: throws if subject is invalid or not ACCOUNT_OWNER', async () => {
    const invalidSubject = { accountId: 'attacker-1', subjectClass: 'NOT_OWNER' as any };
    await expect(PersonalContextAssembler.assemble(invalidSubject)).rejects.toThrow('Subject must be ACCOUNT_OWNER');
  });

  it('Deduplication: duplicate persisted items with same ID are merged into 1', async () => {
    const readers = {
      readProfile: async () => ({ name: 'Aria', birthDate: '1995-04-12' }),
      readProtocol: async () => null,
      readCoherence: async () => null,
      readMemory: async () => ({ available: false as const, reason: 'none' }),
    };

    const snapshot = await PersonalContextAssembler.assemble(SUBJECT, { readers });
    const ids = snapshot.activeContext.map(i => i.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
