/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Conflict resolver — pure deterministic, no LLM calls.
 *
 * Rules (precedence order):
 *  1. Expired/inactive items cannot override current valid context.
 *  2. MODEL_INFERENCE never overrides any non-inference source.
 *  3. RETRIEVED_MEMORY cannot override a newer USER_STATED item for the same key.
 *  4. A verified current state may supersede stale historical state.
 *  5. Among same-authority items, prefer the one with later temporal evidence.
 *  6. If unresolvable deterministically → preserve conflict, do NOT guess.
 */

import { AuthorityClass, AUTHORITY_ORDER, PersonalContextConflict, PersonalContextItem, PersonalContextSubject } from './types';

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
 * Given multiple items for the same contextKey, returns either:
 *   { winner: PersonalContextItem }  — deterministically resolved
 *   { conflict: PersonalContextConflict } — unresolvable, preserved
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
  const working = active.length > 0 ? active : items; // If all expired, keep all (will mark as historical)

  // Rule 2: MODEL_INFERENCE never overrides non-inference.
  const nonInference = working.filter(i => i.authorityClass !== 'MODEL_INFERENCE');
  const candidates = nonInference.length > 0 ? nonInference : working;

  if (candidates.length === 1) {
    return { winner: candidates[0] };
  }

  // Rule 3: RETRIEVED_MEMORY cannot override a newer USER_STATED for same key.
  const userStated = candidates.filter(i => i.authorityClass === 'USER_STATED');
  const retrievedMem = candidates.filter(i => i.authorityClass === 'RETRIEVED_MEMORY');
  if (userStated.length > 0 && retrievedMem.length > 0) {
    // Among user-stated, pick the latest.
    const latestUS = userStated.reduce(laterOf);
    // Any retrieved memory that is older than latestUS is removed.
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

  // Rule 4 & 5: Sort by authority then by temporal evidence, pick winner.
  const sorted = [...candidates].sort((a, b) => {
    const authDiff = AUTHORITY_ORDER[a.authorityClass] - AUTHORITY_ORDER[b.authorityClass];
    if (authDiff !== 0) return authDiff;
    // Same authority: prefer later temporal evidence.
    const tA = new Date(a.occurredAt ?? a.observedAt).getTime();
    const tB = new Date(b.occurredAt ?? b.observedAt).getTime();
    return tB - tA; // descending: most recent first
  });

  const topAuthority = sorted[0].authorityClass;
  const topGroup = sorted.filter(i => i.authorityClass === topAuthority);

  // If all top-authority items have the same value, pick the latest.
  const uniqueValues = new Set(topGroup.map(i => i.value));
  if (uniqueValues.size === 1) {
    return { winner: topGroup.reduce(laterOf) };
  }

  // Rule 6: Cannot resolve deterministically — preserve conflict.
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
