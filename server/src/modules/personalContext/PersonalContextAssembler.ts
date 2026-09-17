/**
 * NAOS Personal Signal Engine — Part 6: Personal Context Engine
 * Phase 6.2 — Trusted Source Assembly (Shadow Mode / Read-Only).
 *
 * KEY INVARIANTS:
 *  - SHADOW_MODE = YES (No route, no API endpoint, no UI).
 *  - READ ONLY = YES (DB_WRITES = 0, no mutations, no migrations).
 *  - NO AI = YES (No Gemini calls, no embeddings, no fact extraction).
 *  - SUBJECT ISOLATION = YES (Restricted to authenticated ACCOUNT_OWNER).
 *  - SOURCE PRIVACY = YES (No PII / values printed in logs).
 *  - NO LAB / SANCTUARY = YES (Split-brain remains DEFERRED_AUTHORITY_AUDIT).
 *  - NO GUARDIAN NOTES = YES (AI distillation excluded from context).
 *  - NO DAILY LAYER B = YES (Symbolic interpretations excluded).
 *  - NO SYMBOLIC ENGINE DUPLICATION = YES (Astrology/Maya/Numerology/Chinese remain NaosSignal).
 */

import { supabase } from '../../lib/supabase';
import { PersonalContextEngine } from './PersonalContextEngine';
import {
  IPersonalContextAdapter,
  PersonalContextItem,
  PersonalContextSnapshot,
  PersonalContextSubject,
  UnavailableSource,
} from './types';
import { ProfileContextAdapter, ProfileContextInput } from './adapters/ProfileContextAdapter';
import { ProtocolContextAdapter, ProtocolContextInput } from './adapters/ProtocolContextAdapter';
import { CoherenceContextAdapter, CoherenceContextInput } from './adapters/CoherenceContextAdapter';
import { MemoryContextAdapter, MemoryAdapterInput, RecalledMemory } from './adapters/MemoryContextAdapter';
import { UserStatedContextAdapter, UserStatedFact } from './adapters/UserStatedContextAdapter';

/**
 * Optional caller-supplied readers or mocks for deterministic testing and dependency injection.
 */
export interface SourceReaders {
  readProfile?: (accountId: string) => Promise<ProfileContextInput | null>;
  readProtocol?: (accountId: string) => Promise<ProtocolContextInput | null>;
  readCoherence?: (accountId: string) => Promise<CoherenceContextInput | null>;
  readMemory?: (accountId: string) => Promise<MemoryAdapterInput>;
}

export interface AssembleContextOptions {
  /** Optional explicit caller-supplied user-stated assertions for current turn (ephemeral only) */
  userStatedFacts?: UserStatedFact[];
  /** Optional custom source readers (defaults to live Supabase read-only queries) */
  readers?: SourceReaders;
}

/**
 * PersonalContextAssembler
 * Orchestrates reading trusted sources, mapping through canonical adapters,
 * and building a PersonalContextSnapshot via PersonalContextEngine.
 */
export class PersonalContextAssembler {
  /**
   * Default Reader: Profile.
   * Reads only canonical allowlisted fields from Supabase `profiles`.
   * Immediately projects into ProfileContextInput — RAW profile row is NEVER exposed to engine.
   */
  private static async defaultReadProfile(accountId: string): Promise<ProfileContextInput | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, birth_date, birth_time, birth_city, birth_state, birth_country, language')
        .eq('id', accountId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        name: data.name ?? null,
        birthDate: data.birth_date ?? null,
        birthTime: data.birth_time ?? null,
        birthCity: data.birth_city ?? null,
        birthState: data.birth_state ?? null,
        birthCountry: data.birth_country ?? null,
        language: data.language ?? null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Default Reader: Protocol.
   * Reads active/persisted protocol and its latest check-in log.
   * Respects canonical Protocol local-date semantics; does not recalculate days.
   */
  private static async defaultReadProtocol(accountId: string): Promise<ProtocolContextInput | null> {
    try {
      const { data: protocol, error } = await supabase
        .from('user_protocols')
        .select('id, status, target_days, current_day')
        .eq('user_id', accountId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !protocol) {
        return null; // NO_PROTOCOL_IS_NON_FATAL = YES
      }

      // Read active intention if available
      let intention: string | null = null;
      try {
        const { data: intentData } = await supabase
          .from('protocols')
          .select('purpose')
          .eq('user_id', accountId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (intentData?.purpose) {
          intention = intentData.purpose;
        }
      } catch {
        // Non-fatal intention lookup
      }

      // Read latest check-in log
      let latestCheckInRef: string | null = null;
      let latestCheckInLocalDate: string | null = null;
      try {
        const { data: lastLog } = await supabase
          .from('protocol_daily_logs')
          .select('id, completed_at, local_date')
          .eq('protocol_id', protocol.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastLog) {
          latestCheckInRef = lastLog.id ?? null;
          latestCheckInLocalDate = lastLog.local_date ?? (lastLog.completed_at ? lastLog.completed_at.split('T')[0] : null);
        }
      } catch {
        // Non-fatal check-in log lookup
      }

      return {
        protocolId: protocol.id,
        status: protocol.status as ProtocolContextInput['status'],
        intention,
        currentDay: protocol.current_day ?? 1,
        targetDays: protocol.target_days ?? 21,
        latestCheckInRef,
        latestCheckInLocalDate,
      };
    } catch {
      return null;
    }
  }

  /**
   * Default Reader: Coherence.
   * Reads current persisted score and streak from `coherence_index`.
   * Does NOT invent defaults like 'MEDIUM' when missing.
   */
  private static async defaultReadCoherence(accountId: string): Promise<CoherenceContextInput | null> {
    try {
      const { data, error } = await supabase
        .from('coherence_index')
        .select('global_coherence, current_streak, last_interaction_at')
        .eq('user_id', accountId)
        .maybeSingle();

      if (error || !data || data.global_coherence == null) {
        return null; // MISSING_COHERENCE_DEFAULT_INVENTED = NO
      }

      return {
        global_coherence: data.global_coherence,
        current_streak: data.current_streak ?? 0,
        lastActionAt: data.last_interaction_at ?? null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Default Reader: Memory.
   * Availability-safe phantom RAG detection.
   * Distinguishes EMPTY memory from UNAVAILABLE infrastructure.
   */
  private static async defaultReadMemory(accountId: string): Promise<MemoryAdapterInput> {
    try {
      const { data, error } = await supabase
        .from('naos_memory')
        .select('id, content, memory_type, module_source, importance, created_at, expires_at')
        .eq('user_id', accountId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        // PostgREST code 42P01: undefined_table (migration not applied)
        return {
          available: false,
          reason: `naos_memory store unavailable: ${error.message || 'table missing or unmigrated'}`,
        };
      }

      const memories: RecalledMemory[] = (data || []).map(row => ({
        id: row.id,
        content: row.content,
        memory_type: row.memory_type,
        module_source: row.module_source,
        importance: row.importance ?? null,
        created_at: row.created_at,
        expires_at: row.expires_at ?? null,
      }));

      return {
        available: true,
        memories,
      };
    } catch (err: unknown) {
      return {
        available: false,
        reason: `naos_memory store check threw error: ${err instanceof Error ? err.message : 'Unknown network/DB error'}`,
      };
    }
  }

  /**
   * Assembles the trusted Personal Context snapshot for an authenticated account owner.
   *
   * @param subject Authenticated account owner subject
   * @param options Assembly options (custom readers, explicit userStatedFacts)
   */
  static async assemble(
    subject: PersonalContextSubject,
    options: AssembleContextOptions = {},
  ): Promise<PersonalContextSnapshot> {
    // Subject isolation check
    if (!subject || !subject.accountId || subject.subjectClass !== 'ACCOUNT_OWNER') {
      throw new Error('PersonalContextAssembler: invalid subject. Subject must be ACCOUNT_OWNER.');
    }

    const readers = options.readers || {};
    const readProfile = readers.readProfile || this.defaultReadProfile;
    const readProtocol = readers.readProtocol || this.defaultReadProtocol;
    const readCoherence = readers.readCoherence || this.defaultReadCoherence;
    const readMemory = readers.readMemory || this.defaultReadMemory;

    const adapters: IPersonalContextAdapter[] = [];
    const unavailableSources: UnavailableSource[] = [];

    // 1. Profile (Required Source)
    try {
      const profileData = await readProfile(subject.accountId);
      if (profileData) {
        adapters.push(new ProfileContextAdapter(profileData));
      } else {
        unavailableSources.push({
          sourceType: 'PROFILE',
          reason: 'Profile data not found or inaccessible for subject',
        });
      }
    } catch (err: unknown) {
      unavailableSources.push({
        sourceType: 'PROFILE',
        reason: err instanceof Error ? err.message : 'Profile reader error',
      });
    }

    // 2. Protocol (Optional Source)
    try {
      const protocolData = await readProtocol(subject.accountId);
      if (protocolData) {
        adapters.push(new ProtocolContextAdapter(protocolData));
      }
      // If protocolData is null, user simply has no active protocol (NO_PROTOCOL_IS_NON_FATAL = YES).
    } catch (err: unknown) {
      unavailableSources.push({
        sourceType: 'PROTOCOL',
        reason: err instanceof Error ? err.message : 'Protocol reader error',
      });
    }

    // 3. Coherence (Optional Source)
    try {
      const coherenceData = await readCoherence(subject.accountId);
      if (coherenceData) {
        adapters.push(new CoherenceContextAdapter(coherenceData));
      }
      // If coherenceData is null, no fabricated context item is created (MISSING_COHERENCE_DEFAULT_INVENTED = NO).
    } catch (err: unknown) {
      unavailableSources.push({
        sourceType: 'COHERENCE',
        reason: err instanceof Error ? err.message : 'Coherence reader error',
      });
    }

    // 4. Memory (Optional Source — phantom RAG safe)
    try {
      const memoryInput = await readMemory(subject.accountId);
      adapters.push(new MemoryContextAdapter(memoryInput));
    } catch (err: unknown) {
      unavailableSources.push({
        sourceType: 'MEMORY_STORE',
        reason: err instanceof Error ? err.message : 'Memory reader error',
      });
    }

    // 5. User-Stated Current-Turn Input (Optional ephemeral caller assertions)
    if (options.userStatedFacts && options.userStatedFacts.length > 0) {
      adapters.push(new UserStatedContextAdapter(options.userStatedFacts));
    }

    // Execute engine in shadow mode
    const engine = new PersonalContextEngine(subject, adapters);
    const snapshot = await engine.build();

    // Deduplicate persisted context items by ID if any adapter emitted identical items
    const seenActive = new Set<string>();
    const deduplicatedActive: PersonalContextItem[] = [];
    for (const item of snapshot.activeContext) {
      if (!seenActive.has(item.id)) {
        seenActive.add(item.id);
        deduplicatedActive.push(item);
      }
    }

    const seenHistorical = new Set<string>();
    const deduplicatedHistorical: PersonalContextItem[] = [];
    for (const item of snapshot.historicalContext) {
      if (!seenHistorical.has(item.id)) {
        seenHistorical.add(item.id);
        deduplicatedHistorical.push(item);
      }
    }

    // Merge any reader-level unavailable sources with engine-level unavailable sources
    const combinedUnavailable = [...snapshot.unavailableSources, ...unavailableSources];
    const seenUnavailable = new Set<string>();
    const deduplicatedUnavailable: UnavailableSource[] = [];
    for (const u of combinedUnavailable) {
      const key = `${u.sourceType}::${u.reason}`;
      if (!seenUnavailable.has(key)) {
        seenUnavailable.add(key);
        deduplicatedUnavailable.push(u);
      }
    }

    return {
      subject: snapshot.subject,
      generatedAt: snapshot.generatedAt,
      activeContext: deduplicatedActive,
      historicalContext: deduplicatedHistorical,
      unresolvedConflicts: snapshot.unresolvedConflicts,
      unavailableSources: deduplicatedUnavailable,
    };
  }

  /**
   * Helper utility to separate presentation metadata from reasoning context items.
   * Future reasoning engines (Domain Projection, Convergence) can filter out
   * presentation-only items using this check.
   */
  static isPresentationMetadata(item: PersonalContextItem): boolean {
    return item.contextKey === 'profile.name';
  }
}
