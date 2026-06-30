# Stack Research

**Domain:** AI-assisted thesis ideation over an archival school corpus
**Researched:** 2026-06-30
**Confidence:** MEDIUM-HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel Chatbot template | Pin current template on clone | App baseline | Matches the PRD requirement to keep auth, persistence, multimodal input, artifacts, and in-browser code execution. |
| Next.js App Router | Template-pinned current Next.js | Full-stack web app | Official App Router model supports layouts, nested routing, route handlers, loading/error states, and React Server Components. |
| Vercel AI SDK | Template-pinned current AI SDK | Chat streaming, tools, providers | Current AI SDK patterns use typed tools with input schemas, `streamText`, multi-step tool calling, UI message streams, and provider pluggability. |
| Qdrant Cloud | Current managed Qdrant | Vector database | Supports dense plus sparse vectors, named vectors, payload filtering, and hybrid query fusion with RRF. |
| Neon Postgres | Template-compatible current Neon | Persistence | Fits the Vercel-hosted template and supports chat/user/document persistence. |
| Gemini embeddings | Decide after Phase 0 | Hosted embeddings | `gemini-embedding-001` is the stable text path; Gemini Embedding 2 Preview supports multimodal unified embeddings. Corpus visual density decides. |
| shadcn/ui + Tailwind | Template-pinned | UI system | Already fits the Vercel Chatbot template and keeps custom artifact UI consistent. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@qdrant/js-client-rest` | Pin latest compatible | Qdrant collection, upsert, query, payload indexes | Retrieval engine and ingestion CLI. |
| `zod` | Template-pinned | Tool input validation | AI SDK tools should expose strict schemas. |
| PDF/text extraction libraries | Decide after corpus inventory | Parse theses, slides, PDFs, and metadata | Pick only after Phase 0 identifies file types and OCR needs. |
| BM25/sparse encoder tooling | Decide after corpus inventory | Generate sparse vectors | Needed for Qdrant sparse vector field; exact approach depends on languages and tokenization. |
| Vitest | Template-compatible | Unit tests | Chunking, metadata extraction, Qdrant wrapper, fusion behavior. |
| Playwright | Template-compatible | E2E tests | Spark flow, Build-on-top flow, proposal artifact editing/versioning. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Corpus inventory script | Discover real archive contents | Must run before schema, parsing, and embedding choices. |
| Ingestion CLI | Idempotent indexing | Should support dry-run, report, and re-run without duplicate points. |
| Environment validation | Check Vercel/Qdrant/Neon/Gemini env vars | Fail early before long ingestion jobs. |
| Eval/check scripts | Judge idea quality | Lightweight rubric should check groundedness, novelty, feasibility, citations, and scope. |

## Installation

Installation is deferred until the template is cloned and package manager is known. Expected additions after template setup:

```bash
# Retrieval and validation
npm install @qdrant/js-client-rest zod

# Testing, if not already present in the template
npm install -D vitest playwright
```

Parser/OCR dependencies should not be installed until Phase 0 shows which file formats and languages exist.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Qdrant hybrid dense+sparse | Dense-only vector search | Only for a corpus with no exact names, acronyms, or multilingual/compound technical terms. This project likely needs hybrid. |
| Gemini Embedding 2 Preview if corpus is visual | `gemini-embedding-001` text-only | Use text-only if Phase 0 shows the corpus is overwhelmingly text-heavy and reliable text extraction is enough. |
| Vercel Chatbot template | Build custom chat app | Only if the template cannot support the required artifact/tool flow after inspection. |
| Cloud-first Vercel/Qdrant/Neon | Self-hosted/offline | Later phase if school requirements demand offline operation or data residency changes. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Final schema before corpus exploration | The PRD intentionally leaves metadata unknown | Phase 0 Corpus Report and user-confirmed schema. |
| Dense-only RAG | Loses exact thesis titles, names, German compounds, acronyms, and technical terms | Qdrant hybrid dense+sparse retrieval with RRF. |
| Generic uncited brainstorming | Violates the project's differentiator | Tool-grounded proposals with citations to prior theses. |
| Non-idempotent ingestion | Re-runs will duplicate or corrupt the index | Stable thesis/chunk IDs and upsert semantics. |
| Client-side retrieval secrets | Exposes Qdrant/Gemini credentials | Server-side route handlers/tools only. |

## Stack Patterns by Variant

**If the corpus is text-heavy and structurally consistent:**
- Use text extraction plus `gemini-embedding-001`.
- Keep sparse vectors for exact terms and filters.

**If the corpus is figure/slide/PDF-heavy:**
- Consider Gemini Embedding 2 Preview for multimodal embeddings.
- Add OCR/image/slide extraction only where the Corpus Report proves it is needed.

**If the corpus is mixed German/English:**
- Keep sparse retrieval and metadata filters first-class.
- Validate tokenization and query behavior against both languages before full indexing.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Vercel Chatbot template | Next.js, AI SDK, shadcn/ui, Tailwind | Pin whatever the current template ships with before adding dependencies. |
| AI SDK tools | Next.js route handlers | Use server-side tools with strict input schemas and streamed UI message responses. |
| Qdrant dense vectors | Chosen embedding model dimensions | Vector dimensions are model-dependent; changing embedding model means re-indexing. |
| Qdrant sparse vectors | Sparse encoder/tokenizer | Sparse vector format and tokenization must be stable for repeatable indexing. |

## Sources

- Context7 `/vercel/ai` - AI SDK tools, `streamText`, multi-step tool calling, UI message streams.
- Context7 `/websites/qdrant_tech` - Qdrant hybrid dense+sparse vectors, RRF, sparse vector configuration.
- Context7 `/vercel/next.js` - App Router concepts, layouts, routing, caching, Tailwind/App structure.
- Google AI official docs: https://ai.google.dev/gemini-api/docs/embeddings - Gemini embeddings overview.
- Google AI official docs: https://ai.google.dev/gemini-api/docs/models/gemini-embedding-2-preview - Gemini Embedding 2 Preview multimodal capability.

---
*Stack research for: Thesis Idea Engine*
*Researched: 2026-06-30*
