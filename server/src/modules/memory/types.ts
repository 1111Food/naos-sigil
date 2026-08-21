export type MemoryType = 'memory' | 'knowledge' | 'state' | 'evidence' | 'history';
export type EntityType = 'user' | 'relationship' | 'project' | 'team' | 'goal' | 'person';

export interface MemoryRecord {
  id: string;
  user_id: string;
  entity_id?: string | null;
  entity_type: EntityType;
  memory_type: MemoryType;
  module_source: string;
  content: string;
  metadata: Record<string, any>;
  importance: number;
  confidence: number;
  superseded_by?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export interface MemorySearchResult extends MemoryRecord {
  similarity: number;
}

export interface MemoryPolicyDecision {
  should_store: boolean;
  importance: number;
  memory_type: MemoryType;
  entity_type?: EntityType;
  entity_id?: string;
  reasoning: string;
  expires_in_days?: number;
}

export interface StoreMemoryInput {
  user_id: string;
  content: string;
  module_source: string;
  entity_id?: string;
  entity_type?: EntityType;
  memory_type?: MemoryType;
  metadata?: Record<string, any>;
  importance?: number;
  confidence?: number;
  expires_at?: string;
  skip_policy?: boolean;
}

export interface MemorySearchFilter {
  memory_type?: MemoryType;
  module_source?: string;
  entity_id?: string;
  min_importance?: number;
}

export interface IEmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  getDimensions(): number;
  getProviderName(): string;
}

export interface IVectorStore {
  store(userId: string, content: string, embedding: number[], record: Partial<MemoryRecord>): Promise<string>;
  search(userId: string, queryEmbedding: number[], limit: number, threshold: number, filter?: MemorySearchFilter): Promise<MemorySearchResult[]>;
  getById(id: string): Promise<MemoryRecord | null>;
  update(id: string, updates: Partial<MemoryRecord>): Promise<void>;
  softDelete(id: string): Promise<void>;
  listByUser(userId: string, limit: number, offset: number, filter?: MemorySearchFilter): Promise<MemoryRecord[]>;
  supersede(oldId: string, newId: string): Promise<void>;
}

export interface MemorySettings {
  user_id: string;
  memory_enabled: boolean;
  auto_save_chat: boolean;
  retention_days: number | null;
}
