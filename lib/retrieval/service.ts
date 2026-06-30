import { validateProjectEnv } from "../env/project";
import { GeminiEmbeddingProvider } from "./embeddings";
import {
  getLocalSourceContext,
  getLocalThesisContext,
  searchLocalChunks,
} from "./local";
import {
  createQdrantClientFromEnv,
  queryHybridPriorWork,
  scrollPriorWorkByFilter,
} from "./qdrant";
import { encodeSparseText } from "./sparse";
import type { RetrievalFilters, RetrievalResult } from "./types";

export type PriorWorkSearchOptions = {
  query: string;
  filters?: RetrievalFilters;
  limit?: number;
};

const germanDiplomaIdeaTerms = [
  "Diplomarbeit",
  "Diplomarbeiten",
  "Abschlussarbeit",
  "Thesis",
  "Thema",
  "Themenvorschlag",
  "Idee",
  "Ideen",
  "Projektarbeit",
  "Matura",
  "HTL",
];

const germanResearchTerms = [
  "Zielsetzung",
  "Problemstellung",
  "Umsetzung",
  "Evaluierung",
  "Erweiterung",
  "Ausblick",
  "Anforderungen",
  "Prototyp",
  "Machbarkeit",
];

function canUseCloudRetrieval(env: NodeJS.ProcessEnv): boolean {
  const validation = validateProjectEnv(env);

  return validation.ok;
}

export function expandGermanPriorWorkQuery(query: string): string {
  const lowerQuery = query.toLowerCase();
  const expansions = new Set<string>();

  if (/diplom|thesis|abschluss|matura|idee|thema|topic/.test(lowerQuery)) {
    for (const term of germanDiplomaIdeaTerms) {
      expansions.add(term);
    }
  }

  if (
    /erweiter|extension|future|ausblick|risk|scope|method|evalu/.test(
      lowerQuery
    )
  ) {
    for (const term of germanResearchTerms) {
      expansions.add(term);
    }
  }

  return [query, ...expansions].join(" ").trim();
}

export async function searchPriorWorkRecords(
  options: PriorWorkSearchOptions,
  env: NodeJS.ProcessEnv = process.env
): Promise<{ source: "qdrant" | "local"; results: RetrievalResult[] }> {
  const expandedQuery = expandGermanPriorWorkQuery(options.query);

  if (canUseCloudRetrieval(env)) {
    const validation = validateProjectEnv(env);
    if (validation.env) {
      const provider = new GeminiEmbeddingProvider({
        apiKey: validation.env.GEMINI_API_KEY,
        model: validation.env.GEMINI_EMBEDDING_MODEL,
      });
      const [denseVector] = await provider.embedTexts([expandedQuery]);
      if (!denseVector) {
        throw new Error("Embedding provider returned no vector.");
      }
      const sparseVector = encodeSparseText(expandedQuery);
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
    results: await searchLocalChunks({ ...options, query: expandedQuery }),
  };
}

export async function getThesisContextRecords(
  options: { thesisId?: string; projectSlug?: string; limit?: number },
  env: NodeJS.ProcessEnv = process.env
): Promise<{ source: "qdrant" | "local"; results: RetrievalResult[] }> {
  if (canUseCloudRetrieval(env)) {
    const validation = validateProjectEnv(env);
    if (validation.env) {
      const client = createQdrantClientFromEnv(env);
      return {
        source: "qdrant",
        results: await scrollPriorWorkByFilter(client, {
          collectionName: validation.env.QDRANT_COLLECTION,
          filters: {
            projectSlug: options.projectSlug,
            thesisId: options.thesisId,
          },
          limit: options.limit,
        }),
      };
    }
  }

  return {
    source: "local",
    results: await getLocalThesisContext(options),
  };
}

export async function getSourceContextRecords(
  options: {
    sourcePath: string;
    thesisId?: string;
    projectSlug?: string;
    limit?: number;
  },
  env: NodeJS.ProcessEnv = process.env
): Promise<{ source: "qdrant" | "local"; results: RetrievalResult[] }> {
  const filters: RetrievalFilters = {
    sourcePath: options.sourcePath,
    thesisId: options.thesisId,
    projectSlug: options.projectSlug,
  };

  if (canUseCloudRetrieval(env)) {
    const validation = validateProjectEnv(env);
    if (validation.env) {
      const client = createQdrantClientFromEnv(env);
      return {
        source: "qdrant",
        results: await scrollPriorWorkByFilter(client, {
          collectionName: validation.env.QDRANT_COLLECTION,
          filters,
          limit: options.limit,
        }),
      };
    }
  }

  return {
    source: "local",
    results: await getLocalSourceContext({
      sourcePath: options.sourcePath,
      thesisId: options.thesisId,
      projectSlug: options.projectSlug,
      limit: options.limit,
    }),
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
