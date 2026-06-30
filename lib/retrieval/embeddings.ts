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

  private async requestEmbeddings(
    input: string | string[]
  ): Promise<DenseVector[]> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input, model: this.model }),
    });

    if (!response.ok) {
      throw new Error(`Gemini embedding request failed: ${response.status}`);
    }

    const json = (await response.json()) as GeminiEmbeddingResponse;
    const vectors = json.data?.map((item) => item.embedding).filter(Boolean);

    if (!vectors?.length) {
      throw new Error("Gemini embedding response did not include vectors.");
    }

    return vectors as DenseVector[];
  }

  async embedTexts(texts: string[]): Promise<DenseVector[]> {
    if (texts.length === 0) {
      return [];
    }

    if (texts.length === 1) {
      return this.requestEmbeddings(texts[0]);
    }

    try {
      const vectors = await this.requestEmbeddings(texts);
      if (vectors.length === texts.length) {
        return vectors;
      }
    } catch {
      // Fall back to documented single-input requests below.
    }

    const vectors: DenseVector[] = [];
    for (const text of texts) {
      const [vector] = await this.requestEmbeddings(text);
      if (!vector) {
        throw new Error("Gemini embedding response did not include a vector.");
      }
      vectors.push(vector);
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
