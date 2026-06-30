<!-- GSD:project-start source:PROJECT.md -->

## Project

**Thesis Idea Engine**

Thesis Idea Engine is a cloud-hosted chatbot that helps software-engineering school students find strong diploma-thesis topics grounded in the school's archive of past theses. It supports two ideation modes: starting from a vague spark or blank slate, and building on top of a selected prior thesis.

The differentiator is a prior-work engine over the full corpus, backed by Qdrant hybrid retrieval and exposed to the chat as tools. The app is not a generic RAG chatbot; it must generate novel, realistic, cited thesis directions by reasoning across prior work.

**Core Value:** Students can get creative but feasible thesis proposals that are grounded in, cite, and build on real prior theses from the archive.

### Constraints

- **Corpus-first design**: Archive exploration must precede schema, parser, chunking, embedding, and indexing decisions - the data shape is unknown.
- **Cloud-first v1**: Use Vercel, Qdrant Cloud, Neon Postgres, and hosted embedding APIs - self-hosted/offline is deferred.
- **Template reuse**: Keep the Vercel Chatbot template's auth, persistence, multimodal input, artifacts system, and in-browser code execution instead of rebuilding them.
- **Retrieval shape**: Hybrid retrieval remains required even if exact schema and embedding model are decided later.
- **User confirmation**: Ask before committing irreversible corpus-derived choices, especially embedding model, metadata schema, chunking, parsing/OCR strategy, build-on selection UX, auth scope, and idea-quality bar.
- **Testing scope**: Keep tests lean and high-signal: ingestion/retrieval unit tests and E2E coverage for both ideation flows plus the custom artifact.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

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

# Retrieval and validation

# Testing, if not already present in the template

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

- Use text extraction plus `gemini-embedding-001`.
- Keep sparse vectors for exact terms and filters.
- Consider Gemini Embedding 2 Preview for multimodal embeddings.
- Add OCR/image/slide extraction only where the Corpus Report proves it is needed.
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

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

## Documentation Lookup

Use Context7 MCP to fetch current documentation whenever work touches a library, framework, SDK, API, CLI tool, or cloud service. Start with `resolve-library-id` unless an exact `/org/project` Context7 ID is already known, then query the selected docs with the full task question.

Prefer Context7 over web search for library documentation. Do not use it for refactoring, scripts from scratch, business-logic debugging, code review, or general programming concepts.

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
