/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Adapter: Profile structural facts.
 *
 * ALLOWLIST ONLY. guardian_notes and AI-derived narratives are excluded.
 * Does NOT perform SELECT *. Does NOT modify UserService queries.
 */

import { IPersonalContextAdapter, PersonalContextItem, PersonalContextSubject } from '../types';
import { buildContextItem } from '../utils';

/** Allowlisted profile fields that carry structural/identity facts. */
const PROFILE_ALLOWLIST = [
  'name',
  'birthDate',
  'birthTime',
  'birthCity',
  'birthState',
  'birthCountry',
  'language',
  'plan_type',
] as const;

type AllowedField = typeof PROFILE_ALLOWLIST[number];

/**
 * Minimal profile shape — only the allowlisted fields.
 * guardian_notes, cached_identity_context, naos_identity_code, etc. are EXCLUDED.
 */
export interface ProfileContextInput {
  name?: string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  birthCity?: string | null;
  birthState?: string | null;
  birthCountry?: string | null;
  language?: string | null;
  plan_type?: string | null;
}

/**
 * Adapter: Profile structural context.
 * Produces LONG_TERM / COMPUTED_CANONICAL items for stable identity fields.
 */
export class ProfileContextAdapter implements IPersonalContextAdapter {
  readonly sourceName = 'ProfileContextAdapter';
  readonly sourceType = 'PROFILE' as const;

  constructor(private readonly profileInput: ProfileContextInput) {}

  async buildContext(subject: PersonalContextSubject): Promise<PersonalContextItem[]> {
    const now = new Date().toISOString();
    const items: PersonalContextItem[] = [];

    for (const field of PROFILE_ALLOWLIST) {
      const raw = this.profileInput[field as AllowedField];
      if (raw == null || raw === '') continue;

      const value = String(raw);
      items.push(buildContextItem({
        subject,
        contextKey: `profile.${field}`,
        authorityClass: 'COMPUTED_CANONICAL',
        value,
        freshness: 'LONG_TERM',
        occurredAt: null,  // Birth facts don't have a precise NAOS-observed time
        observedAt: now,
        validFrom: null,
        validUntil: null,
        provenance: {
          sourceType: 'PROFILE',
          moduleName: 'ProfileContextAdapter',
          sourceRef: field,
          authorityClass: 'COMPUTED_CANONICAL',
          observedAt: now,
        },
        sourceRef: field,
      }));
    }

    return items;
  }
}
