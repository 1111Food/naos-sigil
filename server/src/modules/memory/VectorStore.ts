import { supabase } from '../../lib/supabase';
import { IVectorStore, MemoryRecord, MemorySearchResult, MemorySearchFilter } from './types';

export class SupabaseVectorStore implements IVectorStore {
  /**
   * Stores a new memory record with its embedding.
   */
  async store(userId: string, content: string, embedding: number[], record: Partial<MemoryRecord>): Promise<string> {
    try {
      // Supabase pgvector requires string formatting for vector insertion
      const formattedEmbedding = `[${embedding.join(',')}]`;
      
      const { data, error } = await supabase
        .from('naos_memory')
        .insert({
          user_id: userId,
          content,
          embedding: formattedEmbedding,
          ...record
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from insert');
      }

      return data.id;
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }

  /**
   * Searches for similar memory records.
   */
  async search(userId: string, queryEmbedding: number[], limit: number, threshold: number, filter?: MemorySearchFilter): Promise<MemorySearchResult[]> {
    try {
      const formattedEmbedding = `[${queryEmbedding.join(',')}]`;
      
      const params: any = {
        query_embedding: formattedEmbedding,
        match_user_id: userId,
        match_count: limit,
        match_threshold: threshold
      };

      if (filter?.memory_type) params.filter_memory_type = filter.memory_type;
      if (filter?.module_source) params.filter_module_source = filter.module_source;
      if (filter?.entity_id) params.filter_entity_id = filter.entity_id;

      const { data, error } = await supabase.rpc('match_memory', params);

      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error searching memories:', error);
      throw error;
    }
  }

  /**
   * Retrieves a single memory by ID.
   */
  async getById(id: string): Promise<MemoryRecord | null> {
    try {
      const { data, error } = await supabase
        .from('naos_memory')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error getting memory by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Updates an existing memory record.
   */
  async update(id: string, updates: Partial<MemoryRecord>): Promise<void> {
    try {
      const { error } = await supabase
        .from('naos_memory')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Error updating memory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft deletes a memory by setting is_active to false.
   */
  async softDelete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('naos_memory')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Error soft deleting memory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lists memories for a user with optional filters and pagination.
   */
  async listByUser(userId: string, limit: number, offset: number, filter?: MemorySearchFilter): Promise<MemoryRecord[]> {
    try {
      let query = supabase
        .from('naos_memory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filter?.memory_type) {
        query = query.eq('memory_type', filter.memory_type);
      }
      if (filter?.module_source) {
        query = query.eq('module_source', filter.module_source);
      }
      if (filter?.entity_id) {
        query = query.eq('entity_id', filter.entity_id);
      }
      if (filter?.min_importance !== undefined) {
        query = query.gte('importance', filter.min_importance);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error listing memories for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Supersedes an old memory with a new one.
   */
  async supersede(oldId: string, newId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('naos_memory')
        .update({
          superseded_by: newId,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', oldId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Error superseding memory ${oldId} with ${newId}:`, error);
      throw error;
    }
  }
}
