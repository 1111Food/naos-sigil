/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Utility: deterministic ID generation.
 *
 * Persisted-source IDs are deterministic. Ephemeral IDs are explicitly prefixed.
 */

import { createHash } from 'crypto';
import { AuthorityClass, FreshnessClass, PersonalContextItem, PersonalContextProvenance, PersonalContextSubject } from './types';

/**
 * Builds a deterministic ID for items backed by a persisted record.
 * Input: subject.accountId + sourceType + (sourceRef ?? contextKey) + contextKey
 */
export function buildDeterministicId(
  accountId: string,
  sourceType: string,
  sourceRef: string | null,
  contextKey: string,
): string {
  const raw = `${accountId}::${sourceType}::${sourceRef ?? contextKey}::${contextKey}`;
  return 'pc:' + createHash('sha256').update(raw).digest('hex').substring(0, 32);
}

/**
 * Builds a clearly-ephemeral ID for conversation-turn items.
 * Must NOT look like a stable UUID.
 */
export function buildEphemeralId(contextKey: string, turnIndex: number): string {
  return `EPHEMERAL_${contextKey}_${turnIndex}_${Date.now()}`;
}

/**
 * Builds a PersonalContextItem with required fields enforced.
 */
export function buildContextItem(params: {
  subject: PersonalContextSubject;
  contextKey: string;
  authorityClass: AuthorityClass;
  value: string;
  structuredPayload?: Record<string, unknown>;
  freshness: FreshnessClass;
  occurredAt: string | null;
  observedAt: string;
  validFrom: string | null;
  validUntil: string | null;
  provenance: PersonalContextProvenance;
  sourceRef?: string | null;
}): PersonalContextItem {
  const { subject, contextKey, authorityClass, value, structuredPayload, freshness, occurredAt, observedAt, validFrom, validUntil, provenance, sourceRef } = params;

  const now = new Date(observedAt);
  const expired = validUntil !== null && new Date(validUntil) < now;

  const id = buildDeterministicId(
    subject.accountId,
    provenance.sourceType,
    sourceRef ?? provenance.sourceRef,
    contextKey,
  );

  return {
    id,
    subject,
    contextKey,
    authorityClass,
    value,
    structuredPayload,
    freshness,
    occurredAt,
    observedAt,
    validFrom,
    validUntil,
    expired,
    provenance,
  };
}
