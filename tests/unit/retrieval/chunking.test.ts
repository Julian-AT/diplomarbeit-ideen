import { describe, expect, it } from "vitest";
import { chunkExtractedDocument } from "../../../lib/retrieval/chunking";
import type { ExtractedCorpusDocument } from "../../../lib/retrieval/types";

const baseDocument: ExtractedCorpusDocument = {
  advisor: null,
  authors: [],
  document_type: "thesis",
  extraction_method: "test",
  file_ext: ".pdf",
  file_name: "sample-diplomarbeit.pdf",
  language: "de",
  ocr_required: false,
  pages: [
    { page_number: 1, text: "Alpha thesis content. ".repeat(8) },
    { page_number: 2, text: "Beta method content. ".repeat(8) },
    { page_number: 3, text: "Gamma result content. ".repeat(8) },
  ],
  project_slug: "sample",
  source_path: "archive/sample/sample-diplomarbeit.pdf",
  text_yield: "high",
  thesis_id: "thesis-sample",
  title: "Sample Diplomarbeit",
  year: 2026,
};

describe("chunkExtractedDocument", () => {
  it("creates stable chunk ids and citation payloads", () => {
    const firstRun = chunkExtractedDocument(baseDocument, {
      primaryMaxChars: 180,
    });
    const secondRun = chunkExtractedDocument(baseDocument, {
      primaryMaxChars: 180,
    });

    expect(firstRun.length).toBeGreaterThan(1);
    expect(firstRun.map((chunk) => chunk.id)).toEqual(
      secondRun.map((chunk) => chunk.id)
    );
    expect(firstRun[0].payload).toMatchObject({
      thesis_id: "thesis-sample",
      project_slug: "sample",
      page_start: 1,
      chunk_index: 0,
      citation_label: expect.stringContaining("Sample Diplomarbeit"),
    });
  });

  it("returns no chunks for documents without extracted text", () => {
    const chunks = chunkExtractedDocument({
      ...baseDocument,
      pages: [{ page_number: 1, text: "   " }],
    });

    expect(chunks).toEqual([]);
  });
});
