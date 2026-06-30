import { QdrantClient } from "@qdrant/js-client-rest";
import type {
  CorpusChunk,
  DenseVector,
  RetrievalFilters,
  RetrievalResult,
  SparseVector,
} from "./types";

export const qdrantVectorNames = {
  dense: "text_dense",
  sparse: "text_sparse",
} as const;

export const qdrantPayloadIndexes = [
  { field_name: "project_slug", field_schema: "keyword" },
  { field_name: "document_type", field_schema: "keyword" },
  { field_name: "language", field_schema: "keyword" },
  { field_name: "year", field_schema: "integer" },
  { field_name: "ocr_required", field_schema: "bool" },
] as const;

type QdrantPoint = {
  id: string;
  vector: Record<string, DenseVector | SparseVector>;
  payload: Record<string, unknown>;
};

type QdrantScoredPoint = {
  id: string | number;
  score: number;
  payload?: Record<string, unknown> | null;
};

export type QdrantLikeClient = {
  getCollection(collectionName: string): Promise<unknown>;
  createCollection(
    collectionName: string,
    args: Record<string, unknown>
  ): Promise<unknown>;
  createPayloadIndex(
    collectionName: string,
    args: Record<string, unknown>
  ): Promise<unknown>;
  upsert(
    collectionName: string,
    args: Record<string, unknown>
  ): Promise<unknown>;
  query(
    collectionName: string,
    args: Record<string, unknown>
  ): Promise<{ points: QdrantScoredPoint[] }>;
};

export function createQdrantClientFromEnv(
  env: NodeJS.ProcessEnv
): QdrantClient {
  if (!env.QDRANT_URL || !env.QDRANT_API_KEY) {
    throw new Error("QDRANT_URL and QDRANT_API_KEY are required.");
  }

  return new QdrantClient({
    url: env.QDRANT_URL,
    apiKey: env.QDRANT_API_KEY,
    checkCompatibility: false,
  });
}

function isAlreadyExistsError(error: unknown): boolean {
  return error instanceof Error && /already exists|exists/i.test(error.message);
}

export async function ensureHybridCollection(
  client: QdrantLikeClient,
  options: { collectionName: string; denseSize: number }
): Promise<void> {
  let exists = true;

  try {
    await client.getCollection(options.collectionName);
  } catch {
    exists = false;
  }

  if (!exists) {
    await client.createCollection(options.collectionName, {
      vectors: {
        [qdrantVectorNames.dense]: {
          size: options.denseSize,
          distance: "Cosine",
        },
      },
      sparse_vectors: {
        [qdrantVectorNames.sparse]: {
          index: { on_disk: false },
        },
      },
    });
  }

  for (const index of qdrantPayloadIndexes) {
    try {
      await client.createPayloadIndex(options.collectionName, {
        wait: true,
        field_name: index.field_name,
        field_schema: index.field_schema,
      });
    } catch (error) {
      if (!isAlreadyExistsError(error)) {
        throw error;
      }
    }
  }
}

export function toQdrantPoint(
  chunk: CorpusChunk,
  denseVector: DenseVector,
  sparseVector: SparseVector
): QdrantPoint {
  return {
    id: chunk.id,
    vector: {
      [qdrantVectorNames.dense]: denseVector,
      [qdrantVectorNames.sparse]: sparseVector,
    },
    payload: {
      ...chunk.payload,
      text: chunk.text,
    },
  };
}

export async function upsertChunkPoints(
  client: QdrantLikeClient,
  options: {
    collectionName: string;
    chunks: CorpusChunk[];
    denseVectors: DenseVector[];
    sparseVectors: SparseVector[];
    batchSize?: number;
  }
): Promise<void> {
  const batchSize = options.batchSize ?? 64;

  for (let offset = 0; offset < options.chunks.length; offset += batchSize) {
    const chunks = options.chunks.slice(offset, offset + batchSize);
    const points = chunks.map((chunk, index) =>
      toQdrantPoint(
        chunk,
        options.denseVectors[offset + index],
        options.sparseVectors[offset + index]
      )
    );

    await client.upsert(options.collectionName, { wait: true, points });
  }
}

export function buildPayloadFilter(filters: RetrievalFilters = {}) {
  const must: Record<string, unknown>[] = [];

  if (filters.projectSlug) {
    must.push({ key: "project_slug", match: { value: filters.projectSlug } });
  }

  if (filters.documentTypes?.length) {
    must.push({ key: "document_type", match: { any: filters.documentTypes } });
  }

  if (filters.language) {
    must.push({ key: "language", match: { value: filters.language } });
  }

  if (typeof filters.year === "number") {
    must.push({ key: "year", match: { value: filters.year } });
  }

  if (typeof filters.ocrRequired === "boolean") {
    must.push({ key: "ocr_required", match: { value: filters.ocrRequired } });
  }

  return must.length > 0 ? { must } : undefined;
}

export async function queryHybridPriorWork(
  client: QdrantLikeClient,
  options: {
    collectionName: string;
    denseVector: DenseVector;
    sparseVector: SparseVector;
    filters?: RetrievalFilters;
    limit?: number;
    prefetchLimit?: number;
  }
): Promise<RetrievalResult[]> {
  const filter = buildPayloadFilter(options.filters);
  const prefetchLimit =
    options.prefetchLimit ?? Math.max((options.limit ?? 10) * 4, 20);
  const prefetch = [
    {
      query: { nearest: options.denseVector },
      using: qdrantVectorNames.dense,
      limit: prefetchLimit,
      ...(filter ? { filter } : {}),
    },
    {
      query: { nearest: options.sparseVector },
      using: qdrantVectorNames.sparse,
      limit: prefetchLimit,
      ...(filter ? { filter } : {}),
    },
  ];

  const response = await client.query(options.collectionName, {
    prefetch,
    query: { rrf: { k: 60, weights: [0.55, 0.45] } },
    limit: options.limit ?? 10,
    with_payload: true,
  });

  return response.points.map((point) => {
    const payload = point.payload ?? {};

    return {
      id: String(point.id),
      score: point.score,
      text: typeof payload.text === "string" ? payload.text : null,
      payload: payload as RetrievalResult["payload"],
    };
  });
}
