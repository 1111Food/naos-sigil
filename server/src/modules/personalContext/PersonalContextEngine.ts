/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * PersonalContextEngine — shadow mode, backend only.
 *
 * SHADOW_MODE = YES
 * RUNTIME_CONSUMERS_ADDED = 0
 * USER_VISIBLE_BEHAVIOR_CHANGED = NO
 * DB_WRITES_ADDED = 0
 * GEMINI_CALLS_ADDED = 0
 *
 * Accepts normalized items/adapters and returns a PersonalContextSnapshot.
 * Does NOT return:
 *   - domains, scores, convergence, recommendations, psychological conclusions
 *
 * Conflict resolution is deterministic and LLM-free.
 */

import { resolveContextKey } from './conflictResolver';
import {
  IPersonalContextAdapter,
  PersonalContextConflict,
  PersonalContextItem,
  PersonalContextSnapshot,
  PersonalContextSubject,
  UnavailableSource,
} from './types';
import { MemoryContextAdapter } from './adapters/MemoryContextAdapter';

/**
 * PersonalContextEngine
 *
 * Usage (shadow only):
 *   const engine = new PersonalContextEngine(subject, [adapter1, adapter2, ...]);
 *   const snapshot = await engine.build();
 */
export class PersonalContextEngine {
  constructor(
    private readonly subject: PersonalContextSubject,
    private readonly adapters: IPersonalContextAdapter[],
  ) {}

  async build(): Promise<PersonalContextSnapshot> {
    const now = new Date();
    const nowIso = now.toISOString();
    const unavailableSources: UnavailableSource[] = [];
    let allItems: PersonalContextItem[] = [];

    // Collect items from all adapters — failures are non-fatal.
    for (const adapter of this.adapters) {
      try {
        // Special case: MemoryContextAdapter may report itself unavailable
        if (adapter instanceof MemoryContextAdapter) {
          const unavailable = adapter.getUnavailableSource();
          if (unavailable) {
            unavailableSources.push(unavailable);
            continue; // no items — non-fatal
          }
        }
        const items = await adapter.buildContext(this.subject);
        allItems = allItems.concat(items);
      } catch (err) {
        console.error(`[PersonalContextEngine] Adapter ${adapter.sourceName} failed:`, err);
        unavailableSources.push({
          sourceType: adapter.sourceType,
          reason: err instanceof Error ? err.message : 'Unknown adapter error',
        });
      }
    }

    // Separate active vs historical items.
    const activeItems: PersonalContextItem[] = [];
    const historicalItems: PersonalContextItem[] = [];

    for (const item of allItems) {
      if (item.expired) {
        historicalItems.push(item);
      } else {
        activeItems.push(item);
      }
    }

    // Group active items by contextKey for conflict resolution.
    const keyMap = new Map<string, PersonalContextItem[]>();
    for (const item of activeItems) {
      const bucket = keyMap.get(item.contextKey) ?? [];
      bucket.push(item);
      keyMap.set(item.contextKey, bucket);
    }

    const resolvedActive: PersonalContextItem[] = [];
    const unresolvedConflicts: PersonalContextConflict[] = [];

    for (const [key, items] of keyMap) {
      if (items.length === 1) {
        resolvedActive.push(items[0]);
        continue;
      }
      const result = resolveContextKey(this.subject, key, items, now);
      if ('winner' in result) {
        resolvedActive.push(result.winner);
      } else {
        unresolvedConflicts.push(result.conflict);
      }
    }

    return {
      subject: this.subject,
      generatedAt: nowIso,
      activeContext: resolvedActive,
      historicalContext: historicalItems,
      unresolvedConflicts,
      unavailableSources,
    };
  }
}
