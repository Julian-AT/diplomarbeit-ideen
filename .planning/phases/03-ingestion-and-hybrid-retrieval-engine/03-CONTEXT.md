# Phase 3 Context: Ingestion and Hybrid Retrieval Engine

## Goal

Build the approved corpus ingestion path and typed retrieval wrapper for Qdrant hybrid dense+sparse search.

## Inputs

- Approved corpus manifest: `.planning/corpus/APPROVAL-MANIFEST.json`.
- Extracted raw archive: `.planning/corpus/raw/` (ignored).
- Imported app foundation from Phase 2.
- Env contract for Qdrant/Gemini from `.env.example`.

## Documentation Checked

- Context7 `/llmstxt/qdrant_tech_llms-full_txt`: hybrid dense+sparse collection setup, sparse vectors, payload upsert, RRF fusion.
- Context7 `/qdrant/qdrant-js`: TypeScript method shapes for `createCollection`, `createPayloadIndex`, `upsert`, and `query` with RRF prefetch.
- Context7 `/websites/ai_google_dev_gemini-api`: Gemini OpenAI-compatible embeddings endpoint, `GEMINI_API_KEY`, `gemini-embedding-2-preview`, and `gemini-embedding-001`.

## Decisions

- Use Python for local corpus text extraction because this workspace already has PyMuPDF/pypdf/pdfplumber, and no local `pdftotext`/LibreOffice tools are available.
- Keep indexing and retrieval logic in TypeScript so app-side tools can reuse the same types and wrappers.
- Write generated extraction/index artifacts under ignored `.planning/corpus/extracted/` and `.planning/corpus/index/`.
- Use deterministic UUIDv5-style chunk IDs derived from source path and chunk provenance.
- Use a stable hashed BM25-style sparse encoder so token indices remain stable across reruns even if corpus ordering changes.
- Use Gemini embeddings through the documented OpenAI-compatible endpoint for real ingestion, and deterministic mock embeddings for offline dry-run verification.
- Configure Qdrant with named vectors `text_dense` and `text_sparse`, payload indexes for `project_slug`, `document_type`, `language`, `year`, and `ocr_required`, and RRF query fusion.

## Verification Boundary

Full Qdrant collection creation and Gemini embedding calls require real `QDRANT_URL`, `QDRANT_API_KEY`, `GEMINI_API_KEY`, and the rest of the Phase 2 env contract. Source-level behavior is verified with unit tests and a full-corpus dry-run using mock embeddings.
