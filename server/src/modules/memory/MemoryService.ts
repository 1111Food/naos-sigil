import { supabase } from '../../lib/supabase';
import { 
  MemoryRecord, 
  MemorySearchResult, 
  StoreMemoryInput, 
  MemorySearchFilter, 
  MemorySettings, 
  MemoryPolicyDecision 
} from './types';
import { createEmbeddingProvider } from './EmbeddingProvider';
import { SupabaseVectorStore } from './VectorStore';
import { memoryPolicy } from './MemoryPolicy';

/**
 * Orchestration layer and public interface for the memory system.
 */
export class MemoryService {
  private embeddingProvider = createEmbeddingProvider();
  private vectorStore = new SupabaseVectorStore();

  /**
   * Evaluates text to determine if it should be stored as a memory.
   */
  async evaluate(text: string, context?: { module_source?: string; conversation_summary?: string }): Promise<MemoryPolicyDecision> {
    try {
      return await memoryPolicy.evaluate(text, context);
    } catch (error) {
      console.error('MemoryService: evaluate failed', error);
      return { should_store: false, importance: 1, memory_type: 'memory', reasoning: 'Evaluation error' };
    }
  }

  /**
   * Evaluates and stores a new memory if it meets the policy criteria.
   */
  async remember(input: StoreMemoryInput): Promise<MemoryRecord | null> {
    try {
      const settings = await this.getSettings(input.user_id);
      if (!settings.memory_enabled) {
        return null;
      }

      let policyImportance = input.importance;
      let policyMemoryType = input.memory_type;

      if (!input.skip_policy) {
        const decision = await this.evaluate(input.content);
        if (!decision.should_store) {
          return null;
        }
        if (policyImportance === undefined) {
          policyImportance = decision.importance;
        }
        if (policyMemoryType === undefined) {
          policyMemoryType = decision.memory_type;
        }
      }

      const embedding = await this.embeddingProvider.generateEmbedding(input.content);
      
      const storedId = await this.vectorStore.store(
        input.user_id,
        input.content,
        embedding,
        {
          entity_id: input.entity_id || undefined,
          entity_type: input.entity_type || 'user',
          memory_type: policyMemoryType || 'memory',
          module_source: input.module_source,
          metadata: input.metadata || {},
          importance: (policyImportance || 5) as any,
          confidence: (input.confidence || 1.0) as any,
          expires_at: input.expires_at || undefined,
        }
      );

      return await this.vectorStore.getById(storedId);
    } catch (error) {
      console.error('MemoryService: remember failed', error);
      return null;
    }
  }

  /**
   * Searches for relevant memories.
   */
  async recall(userId: string, query: string, limit = 8, filter?: MemorySearchFilter): Promise<MemorySearchResult[]> {
    try {
      const embedding = await this.embeddingProvider.generateEmbedding(query);
      return await this.vectorStore.search(userId, embedding, limit, 0.65, filter);
    } catch (error) {
      console.error('MemoryService: recall failed', error);
      return [];
    }
  }

  /**
   * Evolves a memory by creating a new version and superseding the old one.
   */
  async evolve(oldMemoryId: string, newContent: string, userId: string): Promise<MemoryRecord | null> {
    try {
      const oldMemory = await this.vectorStore.getById(oldMemoryId);
      if (!oldMemory) {
        console.error(`MemoryService: Evolve failed, old memory ${oldMemoryId} not found.`);
        return null;
      }

      const embedding = await this.embeddingProvider.generateEmbedding(newContent);
      
      const newMemoryId = await this.vectorStore.store(
        userId,
        newContent,
        embedding,
        {
          memory_type: oldMemory.memory_type,
          entity_id: oldMemory.entity_id || undefined,
          entity_type: oldMemory.entity_type,
          module_source: oldMemory.module_source,
          importance: oldMemory.importance as any,
        }
      );

      await this.vectorStore.supersede(oldMemoryId, newMemoryId);
      return await this.vectorStore.getById(newMemoryId);
    } catch (error) {
      console.error('MemoryService: evolve failed', error);
      return null;
    }
  }

  /**
   * Soft deletes a memory.
   */
  async forget(memoryId: string): Promise<void> {
    try {
      await this.vectorStore.softDelete(memoryId);
    } catch (error) {
      console.error('MemoryService: forget failed', error);
    }
  }

  /**
   * Corrects a memory's content in-place.
   */
  async correct(memoryId: string, newContent: string): Promise<MemoryRecord | null> {
    try {
      const embedding = await this.embeddingProvider.generateEmbedding(newContent);
      const { data, error } = await supabase
        .from('naos_memory')
        .update({
          content: newContent,
          embedding
        })
        .eq('id', memoryId)
        .select()
        .single();
        
      if (error) {
        console.error('MemoryService: correct failed via supabase', error);
        return null;
      }
      return data as MemoryRecord;
    } catch (error) {
      console.error('MemoryService: correct failed', error);
      return null;
    }
  }

  /**
   * Gets a single memory by ID.
   */
  async getMemoryById(memoryId: string): Promise<MemoryRecord | null> {
    try {
      return await this.vectorStore.getById(memoryId);
    } catch (error) {
      console.error('MemoryService: getMemoryById failed', error);
      return null;
    }
  }

  /**
   * Lists memories for a user.
   */
  async listMemories(userId: string, limit = 20, offset = 0, filter?: MemorySearchFilter): Promise<MemoryRecord[]> {
    try {
      return await this.vectorStore.listByUser(userId, limit, offset, filter);
    } catch (error) {
      console.error('MemoryService: listMemories failed', error);
      return [];
    }
  }

  /**
   * Gets memory settings for a user. Returns defaults if not found.
   */
  async getSettings(userId: string): Promise<MemorySettings> {
    try {
      const { data, error } = await supabase
        .from('naos_memory_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            user_id: userId,
            memory_enabled: true,
            auto_save_chat: true,
            retention_days: null
          } as MemorySettings;
        }
        console.error('MemoryService: getSettings database error', error);
      }
      
      if (data) {
        return data as MemorySettings;
      }
    } catch (error) {
      console.error('MemoryService: getSettings failed', error);
    }

    return {
      user_id: userId,
      memory_enabled: true,
      auto_save_chat: true,
      retention_days: null
    } as MemorySettings;
  }

  /**
   * Updates settings for a user.
   */
  async updateSettings(userId: string, settings: Partial<MemorySettings>): Promise<void> {
    try {
      const { error } = await supabase
        .from('naos_memory_settings')
        .upsert({ user_id: userId, ...settings });

      if (error) {
        console.error('MemoryService: updateSettings database error', error);
      }
    } catch (error) {
      console.error('MemoryService: updateSettings failed', error);
    }
  }

  /**
   * Gets the provenance chain of a memory.
   */
  async getProvenance(memoryId: string): Promise<MemoryRecord[]> {
    try {
      const chain: Map<string, MemoryRecord> = new Map();
      let currentId: string | null = memoryId;

      while (currentId) {
        const currentRecord: MemoryRecord | null = await this.vectorStore.getById(currentId);

        if (!currentRecord) break;
        chain.set(currentRecord.id, currentRecord);
        
        // Find predecessors: records whose superseded_by points to current
        const { data: predecessors, error: predError } = await supabase
          .from('naos_memory')
          .select('*')
          .eq('superseded_by', currentId);
          
        if (!predError && predecessors) {
          predecessors.forEach((d: any) => {
            if (!chain.has(d.id)) {
              chain.set(d.id, d as MemoryRecord);
            }
          });
        }
        
        currentId = currentRecord.superseded_by || null;
      }
      
      return Array.from(chain.values()).sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } catch (error) {
      console.error('MemoryService: getProvenance failed', error);
      return [];
    }
  }
}

export const memoryService = new MemoryService();
