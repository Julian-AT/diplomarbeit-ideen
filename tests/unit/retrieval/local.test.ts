import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { writeJsonLines } from "../../../lib/retrieval/corpus-io";
import {
  getLocalThesisContext,
  searchLocalChunks,
} from "../../../lib/retrieval/local";
import type { CorpusChunk } from "../../../lib/retrieval/types";

const tempDirs: string[] = [];

const chunks: CorpusChunk[] = [
  {
    id: "11111111-1111-5111-8111-111111111111",
    text: "Hybrid retrieval for German software engineering diploma theses.",
    payload: {
      advisor: null,
      authors: [],
      chunk_id: "11111111-1111-5111-8111-111111111111",
      chunk_index: 0,
      citation_label: "Hybrid Search, p. 1",
      document_type: "thesis",
      extraction_method: "test",
      file_ext: ".pdf",
      file_name: "hybrid.pdf",
      language: "de",
      ocr_required: false,
      page_end: 1,
      page_start: 1,
      project_slug: "hybrid-search",
      source_path: "archive/hybrid-search/hybrid.pdf",
      text_yield: "high",
      thesis_id: "thesis-hybrid-search",
      title: "Hybrid Search",
      year: 2026,
    },
  },
  {
    id: "22222222-2222-5222-8222-222222222222",
    text: "Mobile application usability testing and deployment.",
    payload: {
      advisor: null,
      authors: [],
      chunk_id: "22222222-2222-5222-8222-222222222222",
      chunk_index: 0,
      citation_label: "Mobile App, p. 2",
      document_type: "report",
      extraction_method: "test",
      file_ext: ".pdf",
      file_name: "mobile.pdf",
      language: "en",
      ocr_required: false,
      page_end: 2,
      page_start: 2,
      project_slug: "mobile-app",
      source_path: "archive/mobile-app/mobile.pdf",
      text_yield: "high",
      thesis_id: "thesis-mobile-app",
      title: "Mobile App",
      year: 2025,
    },
  },
];

async function writeChunksFile() {
  const dir = await mkdtemp(path.join(tmpdir(), "tie-local-retrieval-"));
  tempDirs.push(dir);
  const chunksPath = path.join(dir, "chunks.jsonl");
  await writeJsonLines(chunksPath, chunks);
  return chunksPath;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  );
});

describe("local retrieval", () => {
  it("scores keyword matches and applies project filters", async () => {
    const chunksPath = await writeChunksFile();
    const results = await searchLocalChunks({
      query: "hybrid German retrieval",
      filters: { projectSlug: "hybrid-search" },
      chunksPath,
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: chunks[0].id,
      payload: { project_slug: "hybrid-search" },
    });
  });

  it("returns context for build-on-top thesis selection", async () => {
    const chunksPath = await writeChunksFile();
    const results = await getLocalThesisContext({
      thesisId: "thesis-mobile-app",
      chunksPath,
    });

    expect(results).toHaveLength(1);
    expect(results[0].payload.citation_label).toBe("Mobile App, p. 2");
  });
});
