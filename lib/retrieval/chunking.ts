import { stableUuid } from "./ids";
import type {
  CorpusChunk,
  ExtractedCorpusDocument,
  ExtractedCorpusPage,
} from "./types";

export type ChunkingOptions = {
  primaryMaxChars?: number;
  supportingMaxChars?: number;
  pageOverlap?: number;
};

const primaryDocumentTypes = new Set(["thesis", "report", "planning"]);

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function humanTitleFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function pageNumber(page: ExtractedCorpusPage): number | null {
  return page.page_number ?? page.slide_number ?? null;
}

function citationLabel(
  document: ExtractedCorpusDocument,
  pageStart: number | null,
  pageEnd: number | null
): string {
  const title = document.title || humanTitleFromFileName(document.file_name);

  if (pageStart === null) {
    return title;
  }

  if (pageEnd === null || pageStart === pageEnd) {
    return `${title}, p. ${pageStart}`;
  }

  return `${title}, pp. ${pageStart}-${pageEnd}`;
}

function splitLongText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const hardEnd = Math.min(cursor + maxChars, text.length);
    const paragraphBreak = text.lastIndexOf(". ", hardEnd);
    const end =
      paragraphBreak > cursor + maxChars * 0.6 ? paragraphBreak + 1 : hardEnd;
    chunks.push(text.slice(cursor, end).trim());
    cursor = end;
  }

  return chunks.filter(Boolean);
}

function emitChunk(
  document: ExtractedCorpusDocument,
  text: string,
  chunkIndex: number,
  pageStart: number | null,
  pageEnd: number | null
): CorpusChunk {
  const chunkId = stableUuid(
    `${document.source_path}#${chunkIndex}:${pageStart ?? ""}:${pageEnd ?? ""}`
  );

  return {
    id: chunkId,
    text,
    payload: {
      thesis_id: document.thesis_id,
      project_slug: document.project_slug,
      title: document.title || humanTitleFromFileName(document.file_name),
      document_type: document.document_type,
      source_path: document.source_path,
      file_name: document.file_name,
      file_ext: document.file_ext,
      year: document.year,
      language: document.language,
      authors: document.authors,
      advisor: document.advisor,
      page_start: pageStart,
      page_end: pageEnd,
      chunk_id: chunkId,
      chunk_index: chunkIndex,
      extraction_method: document.extraction_method,
      text_yield: document.text_yield,
      ocr_required: document.ocr_required,
      citation_label: citationLabel(document, pageStart, pageEnd),
    },
  };
}

export function chunkExtractedDocument(
  document: ExtractedCorpusDocument,
  options: ChunkingOptions = {}
): CorpusChunk[] {
  const pages = document.pages
    .map((page) => ({ ...page, text: normalizeWhitespace(page.text) }))
    .filter((page) => page.text.length > 0);

  if (pages.length === 0) {
    return [];
  }

  const maxChars = primaryDocumentTypes.has(document.document_type)
    ? (options.primaryMaxChars ?? 3500)
    : (options.supportingMaxChars ?? 1800);
  const pageOverlap = primaryDocumentTypes.has(document.document_type)
    ? (options.pageOverlap ?? 1)
    : 0;
  const chunks: CorpusChunk[] = [];
  let currentPages: ExtractedCorpusPage[] = [];
  let currentText = "";

  function flush() {
    if (currentPages.length === 0 || !currentText.trim()) {
      return;
    }

    const firstPage = pageNumber(currentPages[0]);
    const lastPageSource = currentPages.at(-1);
    const lastPage = lastPageSource ? pageNumber(lastPageSource) : firstPage;

    for (const piece of splitLongText(currentText.trim(), maxChars)) {
      chunks.push(
        emitChunk(document, piece, chunks.length, firstPage, lastPage)
      );
    }
  }

  for (const page of pages) {
    const nextText = currentText ? `${currentText}\n\n${page.text}` : page.text;

    if (currentPages.length > 0 && nextText.length > maxChars) {
      flush();
      currentPages = pageOverlap > 0 ? currentPages.slice(-pageOverlap) : [];
      currentText = currentPages.map((item) => item.text).join("\n\n");
    }

    currentPages.push(page);
    currentText = currentText ? `${currentText}\n\n${page.text}` : page.text;
  }

  flush();

  return chunks;
}

export function chunkExtractedDocuments(
  documents: ExtractedCorpusDocument[],
  options: ChunkingOptions = {}
): CorpusChunk[] {
  return documents.flatMap((document) =>
    chunkExtractedDocument(document, options)
  );
}
