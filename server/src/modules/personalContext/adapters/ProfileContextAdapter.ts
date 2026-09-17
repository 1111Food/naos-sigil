/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Adapter: Profile structural facts.
 *
 * ALLOWLIST ONLY. guardian_notes and AI-derived narratives are excluded.
 * Does NOT perform SELECT *. Does NOT modify UserService queries.
 *
 * AUTHORITY CLASSIFICATION (explicit):
 *
 *   USER_STATED (3) — data explicitly supplied by the user during onboarding or
 *   settings. The source is the user asserting the value; NAOS has not computed
 *   it. Even though it is persisted, persistence does not change the origin.
 *     → name, birthDate, birthTime, birthCity, birthState, birthCountry, language
 *
 *   VERIFIED_STATE (2) — current account/subscription state confirmed by the
 *   application backend (billing system, Paddle). Not computed by NAOS math.
 *     → plan_type  [REMOVED from V1 — see note below]
 *
 * NOTE — plan_type REMOVED from V1:
 *   plan_type is product entitlement, not personal life context.
 *   No Part 7–9 personal intelligence use-case requires it for life reasoning.
 *   Entitlement logic must not masquerade as Personal Context.
 *
 * WHAT COMPUTED_CANONICAL ACTUALLY MEANS:
 *   A value that NAOS *derives deterministically from authoritative inputs*
 *   using canonical math (e.g. signal engine). Examples:
 *     - Natal Sun sign computed from birthDate + birthCity lat/lng
 *     - Personal Year number reduced from birthDate + current year
 *     - Maya Nawal computed from an ISO date
 *   birthDate itself is NOT COMPUTED_CANONICAL — it is the raw input.
 *   The astrological result computed from birthDate IS COMPUTED_CANONICAL.
 *   Those computed results are emitted by the Signal Engine adapters, not here.
 *
 * COMPUTED_CANONICAL_DEFINITION_EXPLICIT = YES
 * RAW_USER_INPUT_MARKED_COMPUTED_CANONICAL = NO
 */

import { AuthorityClass, IPersonalContextAdapter, PersonalContextItem, PersonalContextSubject } from '../types';
import { buildContextItem } from '../utils';

/**
 * Field → authority classification for each profile field.
 * USER_STATED: the user supplied this value during onboarding or settings.
 * NOT COMPUTED_CANONICAL: these are source inputs, not NAOS-computed results.
 */
const PROFILE_FIELD_AUTHORITY: Record<string, AuthorityClass> = {
  name:          'USER_STATED',   // User-chosen display name
  birthDate:     'USER_STATED',   // User-supplied during onboarding
  birthTime:     'USER_STATED',   // User-supplied (optional)
  birthCity:     'USER_STATED',   // User-supplied during onboarding
  birthState:    'USER_STATED',   // User-supplied during onboarding
  birthCountry:  'USER_STATED',   // User-supplied during onboarding
  language:      'USER_STATED',   // User preference, explicitly chosen
} as const;

/** Allowlisted profile fields that carry structural/identity facts. */
const PROFILE_ALLOWLIST = [
  'name',
  'birthDate',
  'birthTime',
  'birthCity',
  'birthState',
  'birthCountry',
  'language',
  // plan_type REMOVED: product entitlement ≠ personal life context
] as const;

type AllowedField = typeof PROFILE_ALLOWLIST[number];

/**
 * Minimal profile shape — only the allowlisted fields.
 * guardian_notes, cached_identity_context, naos_identity_code,
 * email, plan_type, billing identifiers are EXCLUDED.
 */
export interface ProfileContextInput {
  name?: string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  birthCity?: string | null;
  birthState?: string | null;
  birthCountry?: string | null;
  language?: string | null;
}

/**
 * Adapter: Profile structural context.
 * Produces LONG_TERM / USER_STATED items for stable identity fields.
 *
 * Authority is USER_STATED — these are facts the user supplied to NAOS.
 * The *computed results* derived from this data (natal sign, numerology number,
 * Maya nawal) are COMPUTED_CANONICAL and are produced by Signal Engine adapters.
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

      const authority: AuthorityClass = PROFILE_FIELD_AUTHORITY[field] ?? 'USER_STATED';
      const value = String(raw);

      items.push(buildContextItem({
        subject,
        contextKey: `profile.${field}`,
        authorityClass: authority,
        value,
        freshness: 'LONG_TERM',
        occurredAt: null,  // User-supplied facts: occurred_at is unknown to NAOS
        observedAt: now,
        validFrom: null,
        validUntil: null,
        provenance: {
          sourceType: 'PROFILE',
          moduleName: 'ProfileContextAdapter',
          sourceRef: field,
          authorityClass: authority,
          observedAt: now,
        },
        sourceRef: field,
      }));
    }

    return items;
  }
}
