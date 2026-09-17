/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Canonical type definitions.
 *
 * KEY INVARIANTS:
 *  - PersonalContextItem is NOT NaosSignal. No symbolic interpretation here.
 *  - Authority hierarchy is ordinal, NOT a numeric score.
 *  - MODEL_INFERENCE can never override any non-inference source.
 *  - Expired items cannot represent current state.
 *  - No Gemini calls. No DB writes.
 */

// ---------------------------------------------------------------------------
// SUBJECT
// ---------------------------------------------------------------------------

/**
 * V1 lock: Personal Context subjects are always the account owner.
 * Future versions may support sub-profiles but MUST NOT be assumed here.
 */
export type PersonalContextSubject = {
  /** User's auth/account UUID */
  accountId: string;
  /** V1 always ACCOUNT_OWNER */
  subjectClass: 'ACCOUNT_OWNER';
};

// ---------------------------------------------------------------------------
// AUTHORITY CLASSES
// Ordinal hierarchy (higher index = lower authority).
// NOT a numeric truth/confidence score.
// ---------------------------------------------------------------------------

export type AuthorityClass =
  | 'COMPUTED_CANONICAL'   // 1 — Deterministic math (signal engine outputs)
  | 'VERIFIED_STATE'       // 2 — Persisted app-state (check-ins, coherence, etc.)
  | 'USER_STATED'          // 3 — Verbatim user assertion (no AI extraction)
  | 'RETRIEVED_MEMORY'     // 4 — RAG memory recall
  | 'MODEL_INFERENCE';     // 5 — AI summary / narrative — LOWEST

/** Ordinal comparison: lower number wins in a conflict */
export const AUTHORITY_ORDER: Record<AuthorityClass, number> = {
  COMPUTED_CANONICAL: 1,
  VERIFIED_STATE:     2,
  USER_STATED:        3,
  RETRIEVED_MEMORY:   4,
  MODEL_INFERENCE:    5,
};

// ---------------------------------------------------------------------------
// FRESHNESS
// Source-aware. DO NOT assume created_at === occurred_at.
// ---------------------------------------------------------------------------

export type FreshnessClass =
  | 'CURRENT'      // Active right now (e.g. active Protocol)
  | 'RECENT'       // Within a meaningful short window (source-defined)
  | 'LONG_TERM'    // Stable but not necessarily current (e.g. birthDate)
  | 'HISTORICAL'   // Past / completed (e.g. finished Protocol)
  | 'UNKNOWN';     // Insufficient temporal evidence

// ---------------------------------------------------------------------------
// PROVENANCE
// ---------------------------------------------------------------------------

export type SourceType =
  | 'PROFILE'              // Structural profile field
  | 'PROTOCOL'             // Protocol service state
  | 'COHERENCE'            // Coherence engine/history
  | 'MEMORY_STORE'         // naos_memory vector store
  | 'CONVERSATION_TURN'    // Single in-session user message (ephemeral)
  | 'LAB_SESSION'          // Lab/Sanctuary session (DEFERRED in V1)
  | 'SYSTEM';              // Internal/computed

export interface PersonalContextProvenance {
  /** What type of source produced this item */
  sourceType: SourceType;
  /** Module path or service name */
  moduleName: string;
  /** Opaque reference to the originating record (e.g. UUID, field name) */
  sourceRef: string | null;
  /** AuthorityClass of the original source */
  authorityClass: AuthorityClass;
  /** Wall-clock time when NAOS observed/retrieved this fact */
  observedAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// PERSONAL CONTEXT ITEM
// ---------------------------------------------------------------------------

/**
 * A single unit of personal context about a subject.
 * NOT a NaosSignal — contains no symbolic interpretation.
 */
export interface PersonalContextItem {
  /**
   * Deterministic ID for persisted-source items:
   *   SHA-256(subject.accountId + sourceType + sourceRef + contextKey)
   * Ephemeral items (CONVERSATION_TURN) use a uuid-like token with a clear
   * EPHEMERAL_ prefix.
   */
  id: string;

  /** Who this context is about */
  subject: PersonalContextSubject;

  /**
   * Semantic category key (e.g. "protocol.activeDay", "coherence.score",
   * "user.intention"). Use dot-notation namespacing.
   */
  contextKey: string;

  /** Authority class of this item */
  authorityClass: AuthorityClass;

  /** Human-readable payload — what this fact says */
  value: string;

  /** Optional: structured payload for programmatic consumers (future) */
  structuredPayload?: Record<string, unknown>;

  /** Freshness classification (source-aware) */
  freshness: FreshnessClass;

  /**
   * When the underlying event occurred (if known).
   * NULL if we cannot distinguish observed vs occurred.
   * DO NOT default to observedAt.
   */
  occurredAt: string | null;

  /**
   * When NAOS first observed/retrieved this fact.
   * Always present.
   */
  observedAt: string;

  /**
   * Optional: earliest time this item is valid.
   * Null = always valid from past.
   */
  validFrom: string | null;

  /**
   * Optional: when this item expires or expires_at from source.
   * Null = no explicit expiry.
   */
  validUntil: string | null;

  /** If true, this item has expired and MUST NOT represent current state */
  expired: boolean;

  /**
   * True if this item is eligible to enter reasoning engines (Part 7 Domain Projection, etc.).
   * False for presentation-only metadata (e.g. profile.name).
   */
  reasoningEligible: boolean;

  /** Full provenance chain */
  provenance: PersonalContextProvenance;
}

// ---------------------------------------------------------------------------
// AUTHENTICATED PRINCIPAL — cross-account isolation
// ---------------------------------------------------------------------------

export interface AuthenticatedPrincipal {
  /** The verified account ID authenticated via auth layer */
  readonly accountId: string;
}

// ---------------------------------------------------------------------------
// CONFLICT
// ---------------------------------------------------------------------------

/**
 * An unresolved conflict between two context items about the same
 * subject + contextKey.
 * The conflict is preserved, NOT sent to an LLM.
 */
export interface PersonalContextConflict {
  contextKey: string;
  subject: PersonalContextSubject;
  /** Items that could not be deterministically resolved */
  candidates: PersonalContextItem[];
  reason: string;
  detectedAt: string;
}

// ---------------------------------------------------------------------------
// PERSONAL CONTEXT SNAPSHOT — engine output
// ---------------------------------------------------------------------------

export interface PersonalContextSnapshot {
  subject: PersonalContextSubject;
  generatedAt: string;

  /** Items that are current and valid (both reasoning and presentation) */
  activeContext: PersonalContextItem[];

  /** Items that are expired, superseded, or historical */
  historicalContext: PersonalContextItem[];

  /**
   * Presentation metadata items (e.g. profile.name).
   * Excluded from reasoning by construction.
   */
  presentationMetadata: PersonalContextItem[];

  /**
   * Reasoning-eligible active context items.
   * Guaranteed safe by construction for Part 7 Domain Projection.
   */
  reasoningContext: PersonalContextItem[];

  /** Conflicts that could not be deterministically resolved */
  unresolvedConflicts: PersonalContextConflict[];

  /**
   * Sources that could not be loaded (e.g. memory DB not applied).
   * Non-fatal — snapshot is still usable without them.
   */
  unavailableSources: UnavailableSource[];
}

export interface UnavailableSource {
  sourceType: SourceType;
  reason: string;
}

// ---------------------------------------------------------------------------
// ADAPTER INTERFACE
// ---------------------------------------------------------------------------

/**
 * Every context source implements this adapter interface.
 * Adapters MUST NOT call external APIs.
 * Adapters MUST NOT write to DB.
 */
export interface IPersonalContextAdapter {
  readonly sourceName: string;
  readonly sourceType: SourceType;
  /**
   * Returns 0..N normalized PersonalContextItems.
   * On failure, returns empty array and logs — NEVER throws.
   */
  buildContext(subject: PersonalContextSubject): Promise<PersonalContextItem[]>;
}
