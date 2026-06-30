export type DocumentType =
  | "thesis"
  | "report"
  | "planning"
  | "proposal"
  | "presentation"
  | "poster"
  | "idea"
  | "pdf-other"
  | "word-document"
  | "image"
  | "video"
  | "logo"
  | string;

export type TextYield = "none" | "low" | "medium" | "high" | "unknown";

export type ExtractedCorpusPage = {
  page_number?: number;
  slide_number?: number;
  text: string;
};

export type ExtractedCorpusDocument = {
  thesis_id: string;
  project_slug: string;
  title: string;
  document_type: DocumentType;
  source_path: string;
  file_name: string;
  file_ext: string;
  year: number | null;
  language: string | null;
  authors: string[];
  advisor: string | null;
  extraction_method: string;
  text_yield: TextYield;
  ocr_required: boolean;
  pages: ExtractedCorpusPage[];
};

export type CorpusChunkPayload = {
  thesis_id: string;
  project_slug: string;
  title: string;
  document_type: DocumentType;
  source_path: string;
  file_name: string;
  file_ext: string;
  year: number | null;
  language: string | null;
  authors: string[];
  advisor: string | null;
  page_start: number | null;
  page_end: number | null;
  chunk_id: string;
  chunk_index: number;
  extraction_method: string;
  text_yield: TextYield;
  ocr_required: boolean;
  citation_label: string;
};

export type CorpusChunk = {
  id: string;
  text: string;
  payload: CorpusChunkPayload;
};

export type SparseVector = {
  indices: number[];
  values: number[];
};

export type DenseVector = number[];

export type RetrievalFilters = {
  projectSlug?: string;
  thesisId?: string;
  sourcePath?: string;
  documentTypes?: string[];
  language?: string;
  year?: number;
  ocrRequired?: boolean;
};

export type RetrievalResult = {
  id: string;
  score: number;
  text: string | null;
  payload: CorpusChunkPayload;
};
