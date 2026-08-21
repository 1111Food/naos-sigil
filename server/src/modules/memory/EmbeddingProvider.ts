import { config } from '../../config/env';
import { IEmbeddingProvider } from './types';

export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  private readonly maxRetries = 3;
  private readonly baseDelayMs = 1000;
  private readonly modelName = 'gemini-embedding-001';
  private readonly dimensionality = 768;

  /**
   * Generates embeddings for the given text using the Gemini REST API.
   * @param text The text to embed.
   * @returns An array of numbers representing the embedding vector.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = config.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    // Truncate to approximately fit within token limits
    const truncatedText = text.length > 2000 ? text.substring(0, 2000) : text;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:embedContent?key=${apiKey}`;
    const payload = {
      model: `models/${this.modelName}`,
      content: { parts: [{ text: truncatedText }] },
      outputDimensionality: this.dimensionality
    };

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.embedding || !data.embedding.values || !Array.isArray(data.embedding.values)) {
          throw new Error('Invalid response format from Gemini API');
        }

        return data.embedding.values;
      } catch (error) {
        attempt++;
        console.error(`Error generating embedding (attempt ${attempt}/${this.maxRetries}):`, error);
        
        if (attempt >= this.maxRetries) {
          throw new Error(`Failed to generate embedding after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Exponential backoff
        const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Unexpected end of generateEmbedding');
  }

  /**
   * Gets the expected dimensions of the output embedding.
   */
  getDimensions(): number {
    return this.dimensionality;
  }

  /**
   * Gets the provider name.
   */
  getProviderName(): string {
    return 'GeminiEmbeddingProvider';
  }
}

/**
 * Factory function to create the embedding provider instance.
 */
export function createEmbeddingProvider(): IEmbeddingProvider {
  return new GeminiEmbeddingProvider();
}
