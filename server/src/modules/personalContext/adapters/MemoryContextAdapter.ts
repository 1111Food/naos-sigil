/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Adapter: Memory Store (RAG) — availability-safe.
 *
 * The naos_memory migration (20260914000001_create_naos_memory.sql) exists in
 * the repository but has NOT been applied to the target database.
 *
 * MEMORY_RUNTIME_OPERATIONAL = NO
 *
 * This adapter:
 * - Can represent retrieved memories as RETRIEVED_MEMORY items
 * - Treats memory unavailability as non-fatal (empty result + unavailable source)
 * - Does NOT treat AI-generated `importance` as truth, authority, or signal strength
 * - Does NOT apply the migration
 * - Does NOT integrate into Sigil runtime
 *
 * When the migration is eventually applied, this adapter becomes operational
 * by passing non-null recalled memories into buildContext().
 */

import {
  IPersonalContextAdapter,
  PersonalContextItem,
  PersonalContextSubject,
  UnavailableSource,
} from '../types';
import { buildContextItem } from '../utils';

/** Minimal shape of a recalled memory record */
export interface RecalledMemory {
  id: string;
  content: string;
  memory_type: string;
  module_source: string;
  /** AI-generated 1-10 score — stored as metadata ONLY, not authority */
  importance?: number | null;
  created_at: string;
  expires_at?: string | null;
}

export type MemoryAdapterInput =
  | { available: true;  memories: RecalledMemory[] }
  | { available: false; reason: string };

/**
 * Adapter: Longitudinal Memory (RAG).
 * If store is unavailable, records an UnavailableSource and returns empty.
 */
export class MemoryContextAdapter implements IPersonalContextAdapter {
  readonly sourceName = 'MemoryContextAdapter';
  readonly sourceType = 'MEMORY_STORE' as const;

  constructor(private readonly input: MemoryAdapterInput) {}

  /** Returns the unavailable source descriptor if store is down. */
  getUnavailableSource(): UnavailableSource | null {
    if (!this.input.available) {
      return {
        sourceType: 'MEMORY_STORE',
        reason: this.input.reason,
      };
    }
    return null;
  }

  async buildContext(subject: PersonalContextSubject): Promise<PersonalContextItem[]> {
    if (!this.input.available) {
      // Non-fatal: return empty, caller will record unavailable source.
      return [];
    }

    const now = new Date().toISOString();
    const items: PersonalContextItem[] = [];

    for (const mem of this.input.memories) {
      const expired = mem.expires_at != null && new Date(mem.expires_at) < new Date();

      items.push(buildContextItem({
        subject,
        contextKey: `memory.${mem.memory_type}.${mem.module_source}`,
        authorityClass: 'RETRIEVED_MEMORY',
        value: mem.content,
        // AI importance stored as metadata ONLY — NOT authority, NOT truth.
        structuredPayload: {
          memory_type: mem.memory_type,
          module_source: mem.module_source,
          // Clearly labelled as legacy metadata — not used for ranking
          legacy_ai_importance_metadata: mem.importance ?? null,
        },
        freshness: expired ? 'HISTORICAL' : 'UNKNOWN', // retrieved memory lacks reliable temporal classification
        occurredAt: null,        // created_at ≠ occurred_at; we cannot assume
        observedAt: now,
        validFrom: null,
        validUntil: mem.expires_at ?? null,
        provenance: {
          sourceType: 'MEMORY_STORE',
          moduleName: 'MemoryContextAdapter',
          sourceRef: mem.id,
          authorityClass: 'RETRIEVED_MEMORY',
          observedAt: now,
        },
        sourceRef: mem.id,
      }));
    }

    return items;
  }
}
