import { config } from '../../config/env';
import { MemoryPolicyDecision } from './types';

// Simple LRU cache implementation
class SimpleCache<K, V> {
  private maxItems: number;
  private cache: Map<K, V>;

  constructor(maxItems: number = 200) {
    this.maxItems = maxItems;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Refresh the key by deleting and re-adding
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxItems) {
      // Delete oldest entry (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}

/**
 * Intelligent filter that decides what deserves to become a memory.
 */
export class MemoryPolicy {
  private cache = new SimpleCache<string, MemoryPolicyDecision>(200);

  /**
   * Helper to hash strings for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Evaluates text to determine if it should be stored as a memory
   * @param text The text to evaluate
   * @param context Additional context like module source or conversation summary
   * @returns The decision on whether to store and memory metadata
   */
  async evaluate(
    text: string,
    context?: { module_source?: string; conversation_summary?: string }
  ): Promise<MemoryPolicyDecision> {
    const cacheKey = this.hashString(text + JSON.stringify(context || {}));
    const cachedDecision = this.cache.get(cacheKey);
    if (cachedDecision) {
      return cachedDecision;
    }

    const fallbackDecision: MemoryPolicyDecision = {
      should_store: false,
      importance: 1,
      memory_type: 'memory',
      reasoning: 'Could not classify'
    };

    try {
      const systemPrompt = `You are a memory classifier for a personal intelligence OS. Evaluate the provided text to decide if it is worth remembering long-term.
Return ONLY valid JSON (no markdown block, no comments).

JSON Schema:
{
  "should_store": boolean,
  "importance": number (1-10),
  "memory_type": "memory" | "knowledge" | "state" | "evidence" | "history",
  "entity_type": string (optional, e.g. "person", "relationship", "project"),
  "reasoning": string,
  "expires_in_days": number (optional, for temporal info)
}

Classification Criteria:
- Goals, decisions, life changes -> should_store: true, importance: 8-10, memory_type: "state"
- Preferences, personality traits -> should_store: true, importance: 6-8, memory_type: "memory"
- Mentions of specific people/relationships -> should_store: true, entity_type: "person" or "relationship"
- Casual greetings, questions about time, simple queries -> should_store: false
- Emotional states without context -> should_store: false (unless recurring)
- Plans, projects, business ideas -> should_store: true, importance: 7-9, memory_type: "state", entity_type: "project"`;

      let promptText = `Text to evaluate: "${text}"`;
      if (context?.module_source) promptText += `\nModule Source: ${context.module_source}`;
      if (context?.conversation_summary) promptText += `\nConversation Summary: ${context.conversation_summary}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${config.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        console.error(`MemoryPolicy evaluation failed with status ${response.status}`);
        return fallbackDecision;
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('No valid content in response');
      }

      const decision = JSON.parse(responseText.trim()) as MemoryPolicyDecision;
      this.cache.set(cacheKey, decision);
      return decision;
    } catch (error) {
      console.error('Error evaluating memory policy:', error);
      return fallbackDecision;
    }
  }
}

export const memoryPolicy = new MemoryPolicy();
