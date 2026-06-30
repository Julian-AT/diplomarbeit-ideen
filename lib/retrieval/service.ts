import { validateProjectEnv } from "../env/project";
import { GeminiEmbeddingProvider } from "./embeddings";
import { getLocalThesisContext, searchLocalChunks } from "./local";
import { createQdrantClientFromEnv, queryHybridPriorWork } from "./qdrant";
import { encodeSparseText } from "./sparse";
import type { RetrievalFilters, RetrievalResult } from "./types";

export type PriorWorkSearchOptions = {
  query: string;
  filters?: RetrievalFilters;
  limit?: number;
};

function canUseCloudRetrieval(env: NodeJS.ProcessEnv): boolean {
  const validation = validateProjectEnv(env);

  return validation.ok;
}

export async function searchPriorWorkRecords(
  options: PriorWorkSearchOptions,
  env: NodeJS.ProcessEnv = process.env
): Promise<{ source: "qdrant" | "local"; results: RetrievalResult[] }> {
  if (canUseCloudRetrieval(env)) {
    const validation = validateProjectEnv(env);
    if (validation.env) {
      const provider = new GeminiEmbeddingProvider({
        apiKey: validation.env.GEMINI_API_KEY,
        model: validation.env.GEMINI_EMBEDDING_MODEL,
      });
      const [denseVector] = await provider.embedTexts([options.query]);
      if (!denseVector) {
        throw new Error("Embedding provider returned no vector.");
      }
      const sparseVector = encodeSparseText(options.query);
      const client = createQdrantClientFromEnv(env);
      const results = await queryHybridPriorWork(client, {
        collectionName: validation.env.QDRANT_COLLECTION,
        denseVector,
        sparseVector,
        filters: options.filters,
        limit: options.limit,
      });

      return { source: "qdrant", results };
    }
  }

  return {
    source: "local",
    results: await searchLocalChunks(options),
  };
}

export async function getThesisContextRecords(options: {
  thesisId?: string;
  projectSlug?: string;
  limit?: number;
}): Promise<{ source: "local"; results: RetrievalResult[] }> {
  return {
    source: "local",
    results: await getLocalThesisContext(options),
  };
}

export function summarizeRetrievalResults(results: RetrievalResult[]): string {
  return results
    .map((result, index) => {
      const payload = result.payload;
      return [
        `[${index + 1}] ${payload.citation_label}`,
        `project=${payload.project_slug}`,
        `type=${payload.document_type}`,
        `source=${payload.source_path}`,
        result.text
          ? `excerpt=${result.text.slice(0, 700)}`
          : "excerpt=unavailable",
      ].join("\n");
    })
    .join("\n\n");
}
