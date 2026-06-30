import type { GeminiEmbeddingModel } from "../env/project";
import { projectEnvDefaults } from "../env/project";
import type { DenseVector } from "./types";

export type EmbeddingProvider = {
  embedTexts(texts: string[]): Promise<DenseVector[]>;
};

export type GeminiEmbeddingProviderOptions = {
  apiKey: string;
  model?: GeminiEmbeddingModel;
  endpoint?: string;
};

type GeminiEmbeddingResponse = {
  data?: Array<{ embedding?: number[] }>;
};

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private readonly apiKey: string;
  private readonly model: GeminiEmbeddingModel;
  private readonly endpoint: string;

  constructor(options: GeminiEmbeddingProviderOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? projectEnvDefaults.GEMINI_EMBEDDING_MODEL;
    this.endpoint =
      options.endpoint ??
      "https://generativelanguage.googleapis.com/v1beta/openai/embeddings";
  }

  async embedTexts(texts: string[]): Promise<DenseVector[]> {
    const vectors: DenseVector[] = [];

    for (const text of texts) {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: text, model: this.model }),
      });

      if (!response.ok) {
        throw new Error(`Gemini embedding request failed: ${response.status}`);
      }

      const json = (await response.json()) as GeminiEmbeddingResponse;
      const embedding = json.data?.[0]?.embedding;

      if (!embedding || embedding.length === 0) {
        throw new Error("Gemini embedding response did not include a vector.");
      }

      vectors.push(embedding);
    }

    return vectors;
  }
}

export class DeterministicMockEmbeddingProvider implements EmbeddingProvider {
  private readonly dimensions: number;

  constructor(dimensions = 32) {
    this.dimensions = dimensions;
  }

  embedTexts(texts: string[]): Promise<DenseVector[]> {
    return Promise.resolve(
      texts.map((text) => deterministicVector(text, this.dimensions))
    );
  }
}

export function deterministicVector(
  text: string,
  dimensions: number
): DenseVector {
  const vector = new Array<number>(dimensions).fill(0);

  for (let index = 0; index < text.length; index += 1) {
    const bucket = index % dimensions;
    vector[bucket] += ((text.charCodeAt(index) % 31) - 15) / 15;
  }

  const magnitude = Math.hypot(...vector) || 1;

  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}
