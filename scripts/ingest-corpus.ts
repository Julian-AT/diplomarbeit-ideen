import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import { validateProjectEnv } from "../lib/env/project";
import { chunkExtractedDocuments } from "../lib/retrieval/chunking";
import {
  loadExtractedDocuments,
  writeChunks,
} from "../lib/retrieval/corpus-io";
import {
  DeterministicMockEmbeddingProvider,
  type EmbeddingProvider,
  GeminiEmbeddingProvider,
} from "../lib/retrieval/embeddings";
import {
  createQdrantClientFromEnv,
  ensureHybridCollection,
  upsertChunkPoints,
} from "../lib/retrieval/qdrant";
import {
  buildSparseCorpusStats,
  encodeSparseText,
} from "../lib/retrieval/sparse";
import type { CorpusChunk } from "../lib/retrieval/types";

config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

type CliOptions = {
  extractedFile: string;
  chunkOutput: string;
  statsOutput: string;
  planOutput: string;
  dryRun: boolean;
  upsert: boolean;
  ensureCollection: boolean;
  mockEmbeddings: boolean;
  mockDimensions: number;
  limit?: number;
};

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function parseOptions(): CliOptions {
  const limit = readFlag("--limit");

  return {
    extractedFile:
      readFlag("--extracted-file") ??
      ".planning/corpus/extracted/documents.jsonl",
    chunkOutput:
      readFlag("--chunk-output") ?? ".planning/corpus/index/chunks.jsonl",
    statsOutput:
      readFlag("--stats-output") ?? ".planning/corpus/index/sparse-stats.json",
    planOutput:
      readFlag("--plan-output") ?? ".planning/corpus/index/ingestion-plan.json",
    dryRun: hasFlag("--dry-run") || !hasFlag("--upsert"),
    upsert: hasFlag("--upsert"),
    ensureCollection: hasFlag("--ensure-collection") || hasFlag("--upsert"),
    mockEmbeddings: hasFlag("--mock-embeddings"),
    mockDimensions: Number(readFlag("--mock-dimensions") ?? 32),
    limit: limit ? Number(limit) : undefined,
  };
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function createEmbeddingProvider(options: CliOptions): EmbeddingProvider {
  if (options.mockEmbeddings) {
    return new DeterministicMockEmbeddingProvider(options.mockDimensions);
  }

  const validation = validateProjectEnv(process.env);
  if (!validation.ok || !validation.env) {
    throw new Error(
      `Real ingestion requires a valid .env.local/process env. Issues: ${validation.issues
        .filter((issue) => issue.level === "error")
        .map((issue) => `${issue.key}: ${issue.message}`)
        .join(", ")}`
    );
  }

  return new GeminiEmbeddingProvider({
    apiKey: validation.env.GEMINI_API_KEY,
    model: validation.env.GEMINI_EMBEDDING_MODEL,
  });
}

async function embedChunks(
  provider: EmbeddingProvider,
  chunks: CorpusChunk[]
): Promise<number[][]> {
  const batchSize = 16;
  const vectors: number[][] = [];

  for (let offset = 0; offset < chunks.length; offset += batchSize) {
    const batch = chunks.slice(offset, offset + batchSize);
    vectors.push(
      ...(await provider.embedTexts(batch.map((chunk) => chunk.text)))
    );
  }

  return vectors;
}

async function main() {
  const options = parseOptions();
  const documents = (await loadExtractedDocuments(options.extractedFile)).slice(
    0,
    options.limit
  );
  const chunks = chunkExtractedDocuments(documents);
  const sparseStats = buildSparseCorpusStats(chunks);
  const sparseVectors = chunks.map((chunk) =>
    encodeSparseText(chunk.text, sparseStats)
  );
  const provider = createEmbeddingProvider(options);
  const denseVectors = await embedChunks(provider, chunks);
  const denseSize = denseVectors[0]?.length ?? 0;
  const collectionName = process.env.QDRANT_COLLECTION ?? "thesis_ideas";

  await writeChunks(options.chunkOutput, chunks);
  await writeJson(options.statsOutput, sparseStats);
  await writeJson(options.planOutput, {
    generated_at: new Date().toISOString(),
    extracted_file: options.extractedFile,
    chunk_output: options.chunkOutput,
    stats_output: options.statsOutput,
    collection_name: collectionName,
    documents: documents.length,
    chunks: chunks.length,
    dense_dimensions: denseSize,
    sparse_vectors: sparseVectors.length,
    dry_run: options.dryRun,
    mock_embeddings: options.mockEmbeddings,
    will_upsert: options.upsert,
  });

  if (options.upsert) {
    const validation = validateProjectEnv(process.env);
    if (!validation.ok) {
      throw new Error(
        "Cannot upsert until project environment validation passes."
      );
    }

    const client = createQdrantClientFromEnv(process.env);

    if (options.ensureCollection) {
      await ensureHybridCollection(client, { collectionName, denseSize });
    }

    await upsertChunkPoints(client, {
      collectionName,
      chunks,
      denseVectors,
      sparseVectors,
    });
  }

  console.log(
    JSON.stringify(
      {
        documents: documents.length,
        chunks: chunks.length,
        dense_dimensions: denseSize,
        dry_run: options.dryRun,
        upserted: options.upsert,
        chunk_output: options.chunkOutput,
        plan_output: options.planOutput,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
