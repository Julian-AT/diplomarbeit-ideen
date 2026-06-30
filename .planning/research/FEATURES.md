# Feature Research

**Domain:** AI-assisted thesis ideation over a prior-work corpus
**Researched:** 2026-06-30
**Confidence:** MEDIUM-HIGH

## Table Stakes

### Corpus Discovery

- Archive location and unpacking workflow.
- Inventory of file types, counts, languages, folder structure, naming conventions, and existing metadata.
- Content characterization: text-heavy versus visual/slide-heavy, structure consistency, OCR needs, and missing metadata.
- Corpus Report written before implementation decisions.

### Ingestion and Retrieval

- Proposed metadata schema derived from real corpus evidence.
- Chunking strategy derived from file structure and thesis sections.
- Embedding model recommendation with rationale and re-indexing warning.
- Idempotent ingestion CLI that can dry-run, index, and re-run safely.
- Qdrant collection with dense and sparse vectors.
- Payload indexes for selective filters discovered in Phase 0.
- Retrieval wrapper that returns cited thesis/chunk evidence, not just text snippets.

### Chat Experience

- Spark-to-ideas mode for vague ideas or blank starts.
- Build-on-top mode for selected/searched existing thesis.
- AI SDK tools for prior-work search, thesis lookup, and extension discovery.
- Grounded answers with citations to real theses.
- Gap surfacing when the corpus lacks evidence.
- Persistent chat history and user sessions from the template baseline.

### Proposal Artifact

- `thesis-proposal` artifact registered in the template's artifact system.
- Editable, versioned proposal document.
- Structure for title, abstract, related work, scope, methodology, deliverables, risks, and references.
- Citations tied to real thesis records/chunks.

### Quality and Testing

- Unit tests for chunking, metadata extraction, Qdrant wrapper, and fusion behavior.
- E2E tests for Spark-to-ideas, Build-on-top, and artifact editing/versioning.
- Lightweight idea-quality rubric for groundedness, novelty, feasibility, scope, and citation quality.

## Differentiators

- Blank-start ideation that reasons across the corpus instead of returning generic topics.
- Cross-thesis synthesis: combining themes, spotting under-explored areas, and extending future-work threads.
- Explicit prior-work grounding with citations in every proposal.
- Corpus-driven ingestion design rather than a fixed schema.
- Optional multimodal embedding path if the archive is figure/slide-heavy.

## Anti-Features

- Generic RAG answers without citations.
- Fixed metadata schema before seeing the archive.
- One-shot indexing that cannot be safely repeated.
- Thesis ideas that ignore feasibility, deliverables, or prior-work overlap.
- Broad administrative features not needed for v1.
- Offline/self-hosted deployment in v1.

## Open User Decisions

These should be asked after Phase 0 evidence exists:

- Embedding model: text-only `gemini-embedding-001` versus multimodal Gemini Embedding 2 Preview.
- Metadata schema and chunking fields.
- OCR, slide extraction, and language handling.
- Build-on-top selection UX: browse list, search, paste id, or combined flow.
- Auth scope: open to all students, school SSO, or restricted pilot.
- Idea-quality bar and evaluation checklist.

## Sources

- `PRD.md` - product modes, differentiator, open decisions, definition of done.
- Context7 `/vercel/ai` - tool calling and UI message stream patterns.
- Context7 `/websites/qdrant_tech` - hybrid retrieval capabilities.

---
*Feature research for: Thesis Idea Engine*
*Researched: 2026-06-30*
