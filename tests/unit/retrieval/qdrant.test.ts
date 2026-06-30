import { describe, expect, it } from "vitest";
import {
  buildPayloadFilter,
  ensureHybridCollection,
  qdrantVectorNames,
  queryHybridPriorWork,
  toQdrantPoint,
} from "../../../lib/retrieval/qdrant";
import type { CorpusChunk } from "../../../lib/retrieval/types";

const chunk: CorpusChunk = {
  id: "11111111-1111-5111-8111-111111111111",
  text: "Grounded thesis text",
  payload: {
    advisor: null,
    authors: [],
    chunk_id: "11111111-1111-5111-8111-111111111111",
    chunk_index: 0,
    citation_label: "Sample, p. 1",
    document_type: "thesis",
    extraction_method: "test",
    file_ext: ".pdf",
    file_name: "sample.pdf",
    language: "de",
    ocr_required: false,
    page_end: 1,
    page_start: 1,
    project_slug: "sample",
    source_path: "sample.pdf",
    text_yield: "high",
    thesis_id: "thesis-sample",
    title: "Sample",
    year: 2026,
  },
};

describe("qdrant wrapper", () => {
  it("uses Qdrant's vector property for named dense and sparse vectors", () => {
    const point = toQdrantPoint(chunk, [0.1, 0.2], {
      indices: [10],
      values: [0.5],
    });

    expect(point).toMatchObject({
      id: chunk.id,
      vector: {
        [qdrantVectorNames.dense]: [0.1, 0.2],
        [qdrantVectorNames.sparse]: { indices: [10], values: [0.5] },
      },
      payload: expect.objectContaining({ text: "Grounded thesis text" }),
    });
    expect("vectors" in point).toBe(false);
  });

  it("creates hybrid collection and approved payload indexes", async () => {
    const calls: { method: string; args: unknown[] }[] = [];
    const client = {
      getCollection: () => {
        calls.push({ method: "getCollection", args: [] });
        return Promise.reject(new Error("not found"));
      },
      createCollection: (...args: unknown[]) => {
        calls.push({ method: "createCollection", args });
        return Promise.resolve();
      },
      createPayloadIndex: (...args: unknown[]) => {
        calls.push({ method: "createPayloadIndex", args });
        return Promise.resolve();
      },
      upsert: () => Promise.resolve(),
      query: () => Promise.resolve({ points: [] }),
      scroll: () => Promise.resolve({ points: [] }),
      count: () => Promise.resolve({ count: 0 }),
    };

    await ensureHybridCollection(client, {
      collectionName: "thesis_ideas",
      denseSize: 1536,
    });

    expect(
      calls.find((call) => call.method === "createCollection")?.args[1]
    ).toMatchObject({
      vectors: {
        [qdrantVectorNames.dense]: { size: 1536, distance: "Cosine" },
      },
      sparse_vectors: {
        [qdrantVectorNames.sparse]: { index: { on_disk: false } },
      },
    });
    expect(
      calls.filter((call) => call.method === "createPayloadIndex")
    ).toHaveLength(9);
  });

  it("builds filtered RRF hybrid query requests", async () => {
    const requests: unknown[] = [];
    const client = {
      getCollection: () => Promise.resolve(),
      createCollection: () => Promise.resolve(),
      createPayloadIndex: () => Promise.resolve(),
      upsert: () => Promise.resolve(),
      scroll: () => Promise.resolve({ points: [] }),
      count: () => Promise.resolve({ count: 0 }),
      query: (_collectionName: string, args: unknown) => {
        requests.push(args);
        return Promise.resolve({
          points: [
            {
              id: chunk.id,
              score: 0.9,
              payload: { ...chunk.payload, text: chunk.text },
            },
          ],
        });
      },
    };

    const results = await queryHybridPriorWork(client, {
      collectionName: "thesis_ideas",
      denseVector: [0.1, 0.2],
      sparseVector: { indices: [1], values: [1] },
      filters: { projectSlug: "sample", documentTypes: ["thesis"] },
      limit: 3,
    });

    expect(requests[0]).toMatchObject({
      prefetch: [
        {
          using: qdrantVectorNames.dense,
          filter: buildPayloadFilter({
            projectSlug: "sample",
            documentTypes: ["thesis"],
          }),
        },
        {
          using: qdrantVectorNames.sparse,
          filter: buildPayloadFilter({
            projectSlug: "sample",
            documentTypes: ["thesis"],
          }),
        },
      ],
      query: { rrf: { k: 60 } },
      limit: 3,
      with_payload: true,
    });
    expect(results[0]).toMatchObject({
      id: chunk.id,
      text: chunk.text,
      score: 0.9,
    });
  });
});
