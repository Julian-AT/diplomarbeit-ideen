# Thesis Idea Engine

## What This Is

Thesis Idea Engine is a cloud-hosted chatbot that helps software-engineering school students find strong diploma-thesis topics grounded in the school's archive of past theses. It supports two ideation modes: starting from a vague spark or blank slate, and building on top of a selected prior thesis.

The differentiator is a prior-work engine over the full corpus, backed by Qdrant hybrid retrieval and exposed to the chat as tools. The app is not a generic RAG chatbot; it must generate novel, realistic, cited thesis directions by reasoning across prior work.

## Core Value

Students can get creative but feasible thesis proposals that are grounded in, cite, and build on real prior theses from the archive.

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] Explore the provided thesis archive before locking schema, parsing, embeddings, or ingestion strategy.
- [ ] Produce a Corpus Report plus a proposed ingestion, metadata, chunking, retrieval, and embedding design for user confirmation.
- [ ] Build from the Vercel Chatbot template using Next.js App Router, AI SDK, shadcn/ui, Tailwind, auth, persistence, multimodal input, artifacts, and in-browser code execution.
- [ ] Implement a Qdrant-backed prior-work engine with dense plus sparse retrieval and reciprocal-rank fusion.
- [ ] Expose prior-work search, thesis lookup, and extension discovery as AI SDK tools used by the chat.
- [ ] Support Spark-to-ideas mode for vague or empty starting points.
- [ ] Support Build-on-top mode for a selected or searched existing thesis.
- [ ] Add a `thesis-proposal` artifact that renders editable, versioned proposals with citations.
- [ ] Verify the retrieval engine with focused unit tests and both chat flows plus artifact behavior with end-to-end tests.

### Out of Scope

- Fully self-hosted or offline deployment - possible later phase, not v1.
- Final embedding model choice before corpus exploration - visual density and parsing needs must drive this.
- Final metadata schema before corpus exploration - fields must be derived from real files and metadata.
- Generic uncited thesis brainstorming - every proposal must be grounded in prior work.
- Exhaustive test coverage - speed matters; tests should focus on ingestion/retrieval logic and the two core flows.

## Context

- Seed brief: `PRD.md`.
- The thesis archive is expected to be present in the project directory as a zip or archive, but it has not been located or inspected yet.
- Phase 0 is intentionally the most important first deliverable. The project must inventory actual file types, counts, languages, naming conventions, structure, metadata, and content density before implementation decisions are locked.
- Retrieval should use Qdrant Cloud with chunk-level points, dense vectors from a hosted embedding API, sparse BM25-style vectors for exact terms/names/multilingual compounds, and reciprocal-rank fusion.
- Chat should call retrieval through tools such as search prior work, get thesis by id, and find extensions.
- The system prompt must require grounding, citations, and gap surfacing so ideas are original but still feasible.
- Hosting target is Vercel. Persistence target is Neon Postgres. Vector DB target is Qdrant Cloud. Chat model should stay pluggable through the AI SDK.

## Constraints

- **Corpus-first design**: Archive exploration must precede schema, parser, chunking, embedding, and indexing decisions - the data shape is unknown.
- **Cloud-first v1**: Use Vercel, Qdrant Cloud, Neon Postgres, and hosted embedding APIs - self-hosted/offline is deferred.
- **Template reuse**: Keep the Vercel Chatbot template's auth, persistence, multimodal input, artifacts system, and in-browser code execution instead of rebuilding them.
- **Retrieval shape**: Hybrid retrieval remains required even if exact schema and embedding model are decided later.
- **User confirmation**: Ask before committing irreversible corpus-derived choices, especially embedding model, metadata schema, chunking, parsing/OCR strategy, build-on selection UX, auth scope, and idea-quality bar.
- **Testing scope**: Keep tests lean and high-signal: ingestion/retrieval unit tests and E2E coverage for both ideation flows plus the custom artifact.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with corpus exploration as Phase 1 | The archive shape is intentionally unknown and determines ingestion, metadata, and embedding choices | Pending |
| Build on the Vercel Chatbot template | It already includes the desired Next.js App Router, AI SDK, auth, persistence, multimodal input, artifacts, and execution baseline | Pending |
| Use Qdrant hybrid retrieval with dense plus sparse vectors | Dense vectors cover semantic similarity; sparse vectors preserve exact technical terms, names, and multilingual compounds | Pending |
| Keep embedding model open until the Corpus Report | Text-only versus multimodal embeddings depends on how visual the corpus is | Pending |
| Add a custom `thesis-proposal` artifact | Proposal output needs editable, versioned structure and citations rather than plain chat text | Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? Move to Out of Scope with reason
2. Requirements validated? Move to Validated with phase reference
3. New requirements emerged? Add to Active
4. Decisions to log? Add to Key Decisions
5. "What This Is" still accurate? Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-30 after initialization*
