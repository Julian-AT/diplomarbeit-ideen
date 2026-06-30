import { describe, expect, it } from "vitest";
import {
  buildSparseCorpusStats,
  encodeSparseText,
  hashTokenToSparseIndex,
  tokenizeSparse,
} from "../../../lib/retrieval/sparse";
import type { CorpusChunk } from "../../../lib/retrieval/types";

const chunk = (id: string, text: string): CorpusChunk => ({
  id,
  text,
  payload: {
    advisor: null,
    authors: [],
    chunk_id: id,
    chunk_index: 0,
    citation_label: "Citation",
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
    year: null,
  },
});

describe("sparse encoding", () => {
  it("tokenizes multilingual technical text without stop words", () => {
    expect(
      tokenizeSparse("Die Smart-Home Anwendung und sensor fusion")
    ).toEqual(
      expect.arrayContaining(["smart-home", "anwendung", "sensor", "fusion"])
    );
  });

  it("creates deterministic sorted sparse vectors", () => {
    const chunks = [
      chunk("1", "sensor fusion sensor"),
      chunk("2", "mobile app fusion"),
    ];
    const stats = buildSparseCorpusStats(chunks);
    const first = encodeSparseText("sensor fusion", stats);
    const second = encodeSparseText("sensor fusion", stats);

    expect(first).toEqual(second);
    expect(first.indices).toEqual(
      [...first.indices].sort((left, right) => left - right)
    );
    expect(first.indices).toContain(hashTokenToSparseIndex("sensor"));
    expect(first.values.every((value) => value > 0)).toBe(true);
  });
});
