/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Adapter: Coherence state.
 *
 * Normalizes EXISTING Coherence runtime/persisted state.
 * Does NOT modify CoherenceEngine or CoherenceEngine.test.ts.
 * Does NOT reinterpret HIGH/MEDIUM/LOW as a psychological diagnosis.
 */

import { IPersonalContextAdapter, PersonalContextItem, PersonalContextSubject } from '../types';
import { buildContextItem } from '../utils';

/** Minimal coherence state shape from CoherenceService.getCoherence() */
export interface CoherenceContextInput {
  global_coherence: number;         // 30–100
  current_streak: number;           // consecutive active days
  lastActionRef?: string | null;    // opaque reference to last coherence_history row
  lastActionAt?: string | null;     // ISO 8601 timestamp of last event
}

/**
 * Maps raw score to textual label — pure arithmetic, no AI.
 * Mirrors DailyContextBuilder mapping exactly.
 */
function scoreToLabel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 75) return 'HIGH';
  if (score < 45)  return 'LOW';
  return 'MEDIUM';
}

/**
 * Adapter: Coherence Engine context.
 * Produces VERIFIED_STATE items only.
 * CoherenceEngine behavior is NOT changed.
 */
export class CoherenceContextAdapter implements IPersonalContextAdapter {
  readonly sourceName = 'CoherenceContextAdapter';
  readonly sourceType = 'COHERENCE' as const;

  constructor(private readonly coherenceInput: CoherenceContextInput | null) {}

  async buildContext(subject: PersonalContextSubject): Promise<PersonalContextItem[]> {
    if (!this.coherenceInput) return [];

    const { global_coherence, current_streak, lastActionRef, lastActionAt } = this.coherenceInput;
    const now = new Date().toISOString();
    const items: PersonalContextItem[] = [];

    const label = scoreToLabel(global_coherence);

    // 1. Coherence level
    items.push(buildContextItem({
      subject,
      contextKey: 'coherence.level',
      authorityClass: 'VERIFIED_STATE',
      value: label,
      structuredPayload: { score: global_coherence, label },
      freshness: 'CURRENT',
      occurredAt: lastActionAt ?? null,
      observedAt: now,
      validFrom: null,
      validUntil: null,
      provenance: {
        sourceType: 'COHERENCE',
        moduleName: 'CoherenceContextAdapter',
        sourceRef: lastActionRef ?? null,
        authorityClass: 'VERIFIED_STATE',
        observedAt: now,
      },
      sourceRef: 'coherence.global',
    }));

    // 2. Streak
    items.push(buildContextItem({
      subject,
      contextKey: 'coherence.currentStreak',
      authorityClass: 'VERIFIED_STATE',
      value: String(current_streak),
      structuredPayload: { current_streak },
      freshness: 'CURRENT',
      occurredAt: lastActionAt ?? null,
      observedAt: now,
      validFrom: null,
      validUntil: null,
      provenance: {
        sourceType: 'COHERENCE',
        moduleName: 'CoherenceContextAdapter',
        sourceRef: lastActionRef ?? null,
        authorityClass: 'VERIFIED_STATE',
        observedAt: now,
      },
      sourceRef: 'coherence.streak',
    }));

    return items;
  }
}
