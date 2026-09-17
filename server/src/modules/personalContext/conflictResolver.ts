/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Conflict resolver — pure deterministic, no LLM calls.
 *
 * Rules (evaluated in order):
 *  1. Expired/inactive items cannot override current valid context.
 *     (Engine pre-filters expired items before calling this resolver,
 *      but the resolver also handles them defensively.)
 *  2. MODEL_INFERENCE never overrides any non-inference source.
 *  3. RETRIEVED_MEMORY cannot override a newer USER_STATED item for the same key.
 *  4. Authority tiebreak: lower ordinal (higher authority) wins.
 *  5. Same authority, same value: any winner (pick later observedAt).
 *  6. Same authority, different value, recency-eligible sources:
 *     prefer the item with later temporal evidence ONLY when the source
 *     class has defensible chronological semantics.
 *  7. Unresolvable deterministically → preserve conflict, do NOT guess.
 *
 * REMOVED: universal 24-hour gap rule.
 *   A newer timestamp does not automatically make a value more true for all
 *   contextKey/source combinations. Recency is only a valid tiebreak for
 *   sources where chronology has clear semantics: VERIFIED_STATE, USER_STATED.
 *   Two conflicting RETRIEVED_MEMORY or MODEL_INFERENCE items at different
 *   timestamps are NOT resolved by recency alone — they produce a conflict.
 *
 * UNIVERSAL_24H_CONFLICT_RULE_EXISTS = NO
 */

import {
  AuthorityClass,
  AUTHORITY_ORDER,
  PersonalContextConflict,
  PersonalContextItem,
  PersonalContextSubject,
} from './types';

/** Returns the item with the later temporal anchor (occurredAt → observedAt). */
function laterOf(a: PersonalContextItem, b: PersonalContextItem): PersonalContextItem {
  const tA = new Date(a.occurredAt ?? a.observedAt).getTime();
  const tB = new Date(b.occurredAt ?? b.observedAt).getTime();
  return tA >= tB ? a : b;
}

/** Returns true if item is active (not expired). */
function isActive(item: PersonalContextItem): boolean {
  return !item.expired;
}

/**
 * Authority classes for which temporal ordering is a DEFENSIBLE tiebreak:
 * i.e. "newer = more current" makes sense for these sources.
 *
 * RETRIEVED_MEMORY and MODEL_INFERENCE are excluded because:
 *   - Memory created_at ≠ when the underlying fact occurred
 *   - Model inferences at different times carry no ordinal truth relationship
 */
const RECENCY_TIEBREAK_ELIGIBLE: Set<AuthorityClass> = new Set([
  'VERIFIED_STATE',
  'USER_STATED',
  'COMPUTED_CANONICAL',
]);

/**
 * Given multiple items for the same semantic contextKey, returns either:
 *   { winner: PersonalContextItem }  — deterministically resolved
 *   { conflict: PersonalContextConflict } — unresolvable, preserved
 *
 * Conflict grouping is per semantic contextKey — callers are responsible
 * for ensuring that only semantically equivalent items are placed in the
 * same bucket. This function does NOT collapse unrelated context facts.
 */
export function resolveContextKey(
  subject: PersonalContextSubject,
  contextKey: string,
  items: PersonalContextItem[],
  now: Date = new Date(),
): { winner: PersonalContextItem } | { conflict: PersonalContextConflict } {
  if (items.length === 0) {
    throw new Error(`resolveContextKey called with empty items for key: ${contextKey}`);
  }
  if (items.length === 1) {
    return { winner: items[0] };
  }

  // Rule 1: Filter out expired items when active alternatives exist.
  const active = items.filter(isActive);
  const working = active.length > 0 ? active : items;

  // Rule 2: MODEL_INFERENCE never overrides non-inference.
  const nonInference = working.filter(i => i.authorityClass !== 'MODEL_INFERENCE');
  const candidates = nonInference.length > 0 ? nonInference : working;

  if (candidates.length === 1) {
    return { winner: candidates[0] };
  }

  // Rule 3: USER_STATED always beats RETRIEVED_MEMORY for the same key.
  // (USER_STATED already wins by authority ordinal, but this is explicit for clarity.)
  const userStated = candidates.filter(i => i.authorityClass === 'USER_STATED');
  const retrievedMem = candidates.filter(i => i.authorityClass === 'RETRIEVED_MEMORY');
  if (userStated.length > 0 && retrievedMem.length > 0) {
    // Among user-stated, pick the latest.
    const latestUS = userStated.reduce(laterOf);
    // Any retrieved memory that is older than latestUS is superseded.
    const validMemory = retrievedMem.filter(m => {
      const mTime = new Date(m.occurredAt ?? m.observedAt).getTime();
      const usTime = new Date(latestUS.occurredAt ?? latestUS.observedAt).getTime();
      return mTime > usTime;
    });
    const reducedCandidates = [latestUS, ...validMemory, ...candidates.filter(
      i => i.authorityClass !== 'USER_STATED' && i.authorityClass !== 'RETRIEVED_MEMORY'
    )];
    if (reducedCandidates.length === 1) {
      return { winner: reducedCandidates[0] };
    }
  }

  // Rule 4: Sort by authority ordinal.
  const sorted = [...candidates].sort(
    (a, b) => AUTHORITY_ORDER[a.authorityClass] - AUTHORITY_ORDER[b.authorityClass]
  );

  const topAuthority = sorted[0].authorityClass;
  const topGroup = sorted.filter(i => i.authorityClass === topAuthority);

  // Rule 5: Same authority, same value → pick latest by observedAt.
  const uniqueValues = new Set(topGroup.map(i => i.value));
  if (uniqueValues.size === 1) {
    return { winner: topGroup.reduce(laterOf) };
  }

  // Rule 6: Same authority, different values.
  // Recency tiebreak ONLY for sources with defensible chronological semantics.
  if (RECENCY_TIEBREAK_ELIGIBLE.has(topAuthority) && topGroup.length === 2) {
    const [a, b] = topGroup;
    const tA = new Date(a.occurredAt ?? a.observedAt).getTime();
    const tB = new Date(b.occurredAt ?? b.observedAt).getTime();
    if (tA !== tB) {
      // A clear temporal ordering exists → prefer the more recent.
      return { winner: tA > tB ? a : b };
    }
    // Timestamps are equal → cannot resolve by recency.
  }

  // Rule 7: Cannot resolve deterministically → preserve conflict.
  return {
    conflict: {
      contextKey,
      subject,
      candidates: topGroup,
      reason: `Multiple ${topAuthority} items with incompatible values: ${[...uniqueValues].join(' vs ')}`,
      detectedAt: now.toISOString(),
    },
  };
}
