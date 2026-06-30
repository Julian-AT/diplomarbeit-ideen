import { access } from "node:fs/promises";
import { readJsonLines } from "./corpus-io";
import { tokenizeSparse } from "./sparse";
import type { CorpusChunk, RetrievalFilters, RetrievalResult } from "./types";

const defaultLocalChunksPath = ".planning/corpus/index/chunks.jsonl";

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function matchesFilters(
  chunk: CorpusChunk,
  filters: RetrievalFilters
): boolean {
  if (
    filters.projectSlug &&
    chunk.payload.project_slug !== filters.projectSlug
  ) {
    return false;
  }

  if (
    filters.documentTypes?.length &&
    !filters.documentTypes.includes(chunk.payload.document_type)
  ) {
    return false;
  }

  if (filters.language && chunk.payload.language !== filters.language) {
    return false;
  }

  if (typeof filters.year === "number" && chunk.payload.year !== filters.year) {
    return false;
  }

  if (
    typeof filters.ocrRequired === "boolean" &&
    chunk.payload.ocr_required !== filters.ocrRequired
  ) {
    return false;
  }

  return true;
}

function scoreChunk(queryTokens: string[], chunk: CorpusChunk): number {
  const chunkTokens = new Set(
    tokenizeSparse(`${chunk.payload.title} ${chunk.text}`)
  );
  let score = 0;

  for (const token of queryTokens) {
    if (chunkTokens.has(token)) {
      score += 1;
    }
  }

  if (chunk.payload.document_type === "thesis") {
    score += 0.2;
  }

  return score;
}

export async function loadLocalChunks(
  chunksPath = defaultLocalChunksPath
): Promise<CorpusChunk[]> {
  if (!(await fileExists(chunksPath))) {
    return [];
  }

  return readJsonLines<CorpusChunk>(chunksPath);
}

export async function searchLocalChunks(options: {
  query: string;
  filters?: RetrievalFilters;
  limit?: number;
  chunksPath?: string;
}): Promise<RetrievalResult[]> {
  const chunks = await loadLocalChunks(options.chunksPath);
  const filters = options.filters ?? {};
  const queryTokens = tokenizeSparse(options.query);

  return chunks
    .filter((chunk) => matchesFilters(chunk, filters))
    .map((chunk) => ({ chunk, score: scoreChunk(queryTokens, chunk) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, options.limit ?? 8)
    .map(({ chunk, score }) => ({
      id: chunk.id,
      score,
      text: chunk.text,
      payload: chunk.payload,
    }));
}

export async function getLocalThesisContext(options: {
  thesisId?: string;
  projectSlug?: string;
  limit?: number;
  chunksPath?: string;
}): Promise<RetrievalResult[]> {
  const chunks = await loadLocalChunks(options.chunksPath);
  const selected = chunks.filter((chunk) => {
    if (options.thesisId && chunk.payload.thesis_id !== options.thesisId) {
      return false;
    }

    if (
      options.projectSlug &&
      chunk.payload.project_slug !== options.projectSlug
    ) {
      return false;
    }

    return true;
  });

  return selected.slice(0, options.limit ?? 12).map((chunk) => ({
    id: chunk.id,
    score: 1,
    text: chunk.text,
    payload: chunk.payload,
  }));
}
