/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Adapter: Protocol 21/90 state.
 *
 * Normalizes EXISTING structured Protocol state without changing Protocol.
 * Does NOT infer motivation or emotion from check-ins.
 * Preserves Protocol's canonical local-date semantics.
 */

import { IPersonalContextAdapter, PersonalContextItem, PersonalContextSubject } from '../types';
import { buildContextItem } from '../utils';

/** Minimal protocol state shape — only what is structurally persisted. */
export interface ProtocolContextInput {
  protocolId: string;
  status: 'active' | 'awaiting_evolution' | 'completed' | 'abandoned';
  intention?: string | null;
  currentDay: number;
  targetDays: number;
  latestCheckInRef?: string | null;  // opaque DB record ref
  latestCheckInLocalDate?: string | null; // YYYY-MM-DD
}

/**
 * Adapter: Protocol 21/90 context.
 * Outputs VERIFIED_STATE items only.
 */
export class ProtocolContextAdapter implements IPersonalContextAdapter {
  readonly sourceName = 'ProtocolContextAdapter';
  readonly sourceType = 'PROTOCOL' as const;

  constructor(private readonly protocolInput: ProtocolContextInput | null) {}

  async buildContext(subject: PersonalContextSubject): Promise<PersonalContextItem[]> {
    if (!this.protocolInput) return [];

    const { protocolId, status, intention, currentDay, targetDays, latestCheckInRef, latestCheckInLocalDate } = this.protocolInput;
    const now = new Date().toISOString();
    const items: PersonalContextItem[] = [];

    // Freshness: active/awaiting = CURRENT, completed = HISTORICAL
    const freshness = (status === 'active' || status === 'awaiting_evolution') ? 'CURRENT' : 'HISTORICAL';
    const validUntil = (status === 'completed' || status === 'abandoned') ? latestCheckInLocalDate ?? now : null;

    // 1. Protocol status
    items.push(buildContextItem({
      subject,
      contextKey: 'protocol.status',
      authorityClass: 'VERIFIED_STATE',
      value: status,
      structuredPayload: { status, currentDay, targetDays, protocolId },
      freshness,
      occurredAt: latestCheckInLocalDate ? `${latestCheckInLocalDate}T00:00:00Z` : null,
      observedAt: now,
      validFrom: null,
      validUntil,
      provenance: {
        sourceType: 'PROTOCOL',
        moduleName: 'ProtocolContextAdapter',
        sourceRef: protocolId,
        authorityClass: 'VERIFIED_STATE',
        observedAt: now,
      },
      sourceRef: protocolId,
    }));

    // 2. Current progress
    items.push(buildContextItem({
      subject,
      contextKey: 'protocol.currentDay',
      authorityClass: 'VERIFIED_STATE',
      value: `${currentDay} / ${targetDays}`,
      structuredPayload: { currentDay, targetDays },
      freshness,
      occurredAt: latestCheckInLocalDate ? `${latestCheckInLocalDate}T00:00:00Z` : null,
      observedAt: now,
      validFrom: null,
      validUntil,
      provenance: {
        sourceType: 'PROTOCOL',
        moduleName: 'ProtocolContextAdapter',
        sourceRef: latestCheckInRef ?? protocolId,
        authorityClass: 'VERIFIED_STATE',
        observedAt: now,
      },
      sourceRef: `${protocolId}::currentDay`,
    }));

    // 3. Intention — only if structurally stored, not inferred
    if (intention && intention.trim()) {
      items.push(buildContextItem({
        subject,
        contextKey: 'protocol.intention',
        authorityClass: 'USER_STATED',
        value: intention.trim(),
        freshness,
        occurredAt: null,   // Intention timestamp not available structurally
        observedAt: now,
        validFrom: null,
        validUntil,
        provenance: {
          sourceType: 'PROTOCOL',
          moduleName: 'ProtocolContextAdapter',
          sourceRef: protocolId,
          authorityClass: 'USER_STATED',
          observedAt: now,
        },
        sourceRef: `${protocolId}::intention`,
      }));
    }

    return items;
  }
}
