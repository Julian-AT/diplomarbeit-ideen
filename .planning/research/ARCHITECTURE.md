# Architecture Research

**Domain:** AI-assisted thesis ideation over a prior-work corpus
**Researched:** 2026-06-30
**Confidence:** MEDIUM

## Recommended Architecture

## Major Components

1. **Next.js Chat App**
   - Vercel Chatbot template baseline.
   - Keeps auth, persistence, multimodal input, artifacts, and code execution.
   - Adds UX entry points for Spark-to-ideas and Build-on-top.

2. **Corpus Explorer**
   - Locates, unpacks, inventories, and characterizes the thesis archive.
   - Produces Corpus Report and proposed ingestion design.
   - Does not index until user confirms irreversible choices.

3. **Ingestion Pipeline**
   - Extracts text and metadata from discovered file formats.
   - Generates stable thesis IDs and chunk IDs.
   - Creates dense embeddings and sparse vectors.
   - Upserts chunk-level points into Qdrant.
   - Writes an ingestion manifest for idempotency and auditability.

4. **Qdrant Prior-Work Index**
   - Collection with named dense and sparse vectors.
   - Payload fields and indexes derived from Phase 0.
   - Query API uses dense/sparse prefetch and RRF fusion.

5. **Retrieval Service**
   - Server-side wrapper around Qdrant queries.
   - Supports search prior work, get thesis by id, and find extensions.
   - Normalizes citations and returns evidence records to chat tools.

6. **AI SDK Chat Orchestration**
   - Server route handlers call `streamText`.
   - Tools have strict input schemas and server-side execute functions.
   - Multi-step tool calls are allowed where prior-work search needs follow-up retrieval.
   - System prompt enforces citation, gap surfacing, and feasibility.

7. **Thesis Proposal Artifact**
   - New `artifacts/thesis-proposal/` module.
   - Registered with artifact definitions.
   - Uses template document handler patterns for editable, versioned proposals.

8. **Tests and Eval**
   - Vitest for extraction, chunking, metadata, Qdrant wrapper, and fusion.
   - Playwright for both chat modes and artifact editing/versioning.
   - Lightweight evaluation fixtures for proposal quality.

## Data Flow

1. User provides or keeps the thesis archive in the project directory.
2. Corpus Explorer unpacks and inventories the archive.
3. User confirms the proposed parser, metadata, chunking, and embedding design.
4. Ingestion Pipeline extracts content, generates vectors, and upserts Qdrant points.
5. Student uses Spark-to-ideas or Build-on-top chat mode.
6. Chat model calls retrieval tools through the AI SDK.
7. Retrieval Service queries Qdrant with dense+sparse hybrid search and returns cited evidence.
8. Chat produces grounded thesis directions and can create/update a `thesis-proposal` artifact.
9. Artifact stores editable proposal versions through the template persistence layer.

## Suggested Build Order

1. Corpus Explorer and design report.
2. Template setup and environment validation.
3. Ingestion and retrieval engine.
4. Chat tools and grounded flows.
5. Proposal artifact and tests.

## Boundaries

| Boundary | Rule |
|----------|------|
| Browser to server | Browser never receives Qdrant, Neon, or embedding provider secrets. |
| Chat to retrieval | Chat accesses corpus only through typed AI SDK tools. |
| Ingestion to Qdrant | Ingestion owns collection creation/upserts and stable IDs. |
| Corpus report to indexing | User confirmation is required before final indexing choices. |
| Artifact to chat | Artifact edits should stay versioned and cite real thesis evidence. |

## Sources

- Context7 `/vercel/ai` - server tools, UI messages, multi-step tool calling.
- Context7 `/websites/qdrant_tech` - hybrid query architecture.
- Context7 `/vercel/next.js` - App Router architecture.
- `PRD.md` - required template reuse and artifact shape.

---
*Architecture research for: Thesis Idea Engine*
*Researched: 2026-06-30*
