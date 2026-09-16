/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Adapter: User-Stated Facts (ephemeral, in-session only for V1).
 *
 * Supports representing verbatim user assertions such as:
 *   "I have a meeting tomorrow"
 *   "I changed jobs"
 *   "My goal is discipline"
 *
 * V1 Constraints:
 * - No persistence (no DB write)
 * - No AI extraction — the caller passes the verbatim text and contextKey
 * - No LLM fact extraction
 * - Ephemeral IDs only
 *
 * USER_STATED_CONTEXT_REQUIRES_AI_EXTRACTION = NO
 */

import { IPersonalContextAdapter, PersonalContextItem, PersonalContextSubject } from '../types';
import { buildEphemeralId } from '../utils';

export interface UserStatedFact {
  /** Semantic context key: e.g. "user.currentGoal", "user.todayEvent" */
  contextKey: string;
  /** Verbatim user assertion text — no extraction performed */
  value: string;
  /** ISO 8601 when the user stated this (conversation turn timestamp) */
  statedAt: string;
}

/**
 * Adapter: Ephemeral user-stated facts.
 * Items produced by this adapter are USER_STATED authority, CURRENT freshness.
 * IDs are explicitly ephemeral (EPHEMERAL_ prefix) — NOT persisted.
 */
export class UserStatedContextAdapter implements IPersonalContextAdapter {
  readonly sourceName = 'UserStatedContextAdapter';
  readonly sourceType = 'CONVERSATION_TURN' as const;

  constructor(private readonly facts: UserStatedFact[]) {}

  async buildContext(subject: PersonalContextSubject): Promise<PersonalContextItem[]> {
    const now = new Date().toISOString();
    return this.facts.map((fact, idx) => {
      const id = buildEphemeralId(fact.contextKey, idx);
      return {
        id,
        subject,
        contextKey: fact.contextKey,
        authorityClass: 'USER_STATED' as const,
        value: fact.value,
        freshness: 'CURRENT' as const,
        occurredAt: fact.statedAt,
        observedAt: now,
        validFrom: fact.statedAt,
        validUntil: null,
        expired: false,
        provenance: {
          sourceType: 'CONVERSATION_TURN' as const,
          moduleName: 'UserStatedContextAdapter',
          sourceRef: null,   // no persisted record ref for ephemeral facts
          authorityClass: 'USER_STATED' as const,
          observedAt: now,
        },
      };
    });
  }
}
