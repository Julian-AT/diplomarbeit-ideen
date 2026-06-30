import type { CorpusChunk, SparseVector } from "./types";

export type SparseCorpusStats = {
  documentCount: number;
  averageDocumentLength: number;
  documentFrequencies: Record<string, number>;
};

const tokenPattern = /[\p{L}\p{N}][\p{L}\p{N}_-]{1,}/gu;
const stopWords = new Set([
  "and",
  "the",
  "for",
  "with",
  "that",
  "this",
  "from",
  "are",
  "was",
  "were",
  "und",
  "der",
  "die",
  "das",
  "den",
  "dem",
  "ein",
  "eine",
  "einer",
  "mit",
  "fuer",
  "von",
  "ist",
  "sind",
  "auf",
  "zur",
  "zum",
]);

export function tokenizeSparse(text: string): string[] {
  return Array.from(text.normalize("NFKC").toLowerCase().matchAll(tokenPattern))
    .map((match) => match[0])
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

export function hashTokenToSparseIndex(token: string): number {
  let hash = 2_166_136_261;

  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0 || 1;
}

export function buildSparseCorpusStats(
  chunks: CorpusChunk[]
): SparseCorpusStats {
  const documentFrequencies: Record<string, number> = {};
  let totalTokens = 0;

  for (const chunk of chunks) {
    const tokens = tokenizeSparse(chunk.text);
    totalTokens += tokens.length;

    for (const token of new Set(tokens)) {
      documentFrequencies[token] = (documentFrequencies[token] ?? 0) + 1;
    }
  }

  return {
    documentCount: chunks.length,
    averageDocumentLength:
      chunks.length === 0 ? 0 : totalTokens / chunks.length,
    documentFrequencies,
  };
}

export function encodeSparseText(
  text: string,
  stats?: SparseCorpusStats
): SparseVector {
  const tokens = tokenizeSparse(text);
  const counts = new Map<string, number>();

  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const weightedByIndex = new Map<number, number>();
  const documentLength = Math.max(tokens.length, 1);
  const averageDocumentLength = Math.max(
    stats?.averageDocumentLength ?? documentLength,
    1
  );
  const documentCount = Math.max(stats?.documentCount ?? 1, 1);
  const k1 = 1.2;
  const b = 0.75;

  for (const [token, termFrequency] of counts) {
    const documentFrequency = stats?.documentFrequencies[token] ?? 1;
    const idf = Math.log(
      1 + (documentCount - documentFrequency + 0.5) / (documentFrequency + 0.5)
    );
    const bm25 =
      (termFrequency * (k1 + 1)) /
      (termFrequency +
        k1 * (1 - b + b * (documentLength / averageDocumentLength)));
    const sparseIndex = hashTokenToSparseIndex(token);
    weightedByIndex.set(
      sparseIndex,
      (weightedByIndex.get(sparseIndex) ?? 0) + idf * bm25
    );
  }

  const entries = Array.from(weightedByIndex.entries())
    .filter(([, value]) => value > 0)
    .sort(([left], [right]) => left - right);

  return {
    indices: entries.map(([index]) => index),
    values: entries.map(([, value]) => Number(value.toFixed(6))),
  };
}

export function isSparseVectorEmpty(vector: SparseVector): boolean {
  return vector.indices.length === 0 || vector.values.length === 0;
}
