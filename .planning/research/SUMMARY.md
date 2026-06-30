# Project Research Summary

**Project:** Thesis Idea Engine
**Domain:** AI-assisted thesis ideation over an archival school corpus
**Researched:** 2026-06-30
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project should be built as a corpus-grounded AI product, not as a generic chatbot. The first deliverable must inspect the real thesis archive and produce a Corpus Report plus proposed ingestion, metadata, chunking, retrieval, and embedding design. That evidence determines whether a text-only embedding path is sufficient or whether a multimodal embedding path is justified.

The architecture should keep the Vercel Chatbot template as the application baseline and add a Qdrant-backed prior-work engine behind AI SDK tools. Current Qdrant documentation supports the PRD's dense+sparse hybrid shape through named dense and sparse vectors, prefetch queries, and RRF fusion. Current AI SDK documentation supports strict server-side tools, streamed chat responses, and multi-step tool calls.

The main roadmap risk is premature commitment: schema, parser, OCR strategy, embedding model, and vector dimensions should not be locked before corpus exploration. The second major risk is citation drift, which should be handled by structured evidence returned from tools and structured references in the `thesis-proposal` artifact.

## Key Findings

### Recommended Stack

Use the Vercel Chatbot template with Next.js App Router, AI SDK, shadcn/ui, Tailwind, Neon Postgres, Qdrant Cloud, and hosted Gemini embeddings. Pin exact versions from the template at clone time rather than guessing them during planning.

**Core technologies:**
- Vercel Chatbot template: app baseline with auth, persistence, multimodal input, artifacts, and execution.
- AI SDK: server-side chat streaming and typed tools for prior-work retrieval.
- Qdrant Cloud: hybrid dense+sparse vector search with RRF.
- Neon Postgres: persistence layer aligned with the template.
- Gemini embeddings: decide after Phase 1 between text-only `gemini-embedding-001` and multimodal Gemini Embedding 2 Preview.

### Expected Features

**Must have (table stakes):**
- Corpus Report before indexing decisions.
- User-confirmed ingestion, metadata, chunking, and embedding design.
- Idempotent ingestion into Qdrant.
- Hybrid retrieval with citations.
- Spark-to-ideas mode.
- Build-on-top mode.
- `thesis-proposal` artifact with editable, versioned cited proposals.
- Focused unit and E2E tests.

**Should have (competitive):**
- Blank-start ideation that surfaces under-explored corpus areas.
- Cross-thesis synthesis and future-work extension reasoning.
- Multimodal embedding path if Phase 1 proves the corpus is visual.

**Defer (v2+):**
- Fully self-hosted/offline deployment.
- Broad admin workflows.
- Exhaustive analytics.

### Architecture Approach

The system should be split into a Next.js chat app, Corpus Explorer, ingestion pipeline, Qdrant prior-work index, retrieval service, AI SDK chat tools, `thesis-proposal` artifact, and focused tests/evals. Browser code should never hold Qdrant, Neon, or embedding provider secrets.

**Major components:**
1. Corpus Explorer - discovers real archive structure and produces the design report.
2. Ingestion Pipeline - extracts, chunks, embeds, sparse-encodes, and upserts stable Qdrant points.
3. Retrieval Service - exposes search/get/find-extension operations over hybrid Qdrant queries.
4. Chat Orchestration - uses AI SDK tools and system prompt constraints for grounded ideation.
5. Proposal Artifact - renders and versions cited thesis proposal documents.

### Critical Pitfalls

1. **Embedding model too early** - defer until visual/text density is known.
2. **Weak metadata** - derive schema from real files and payload-index useful filters.
3. **Dense-only retrieval** - keep sparse vectors for exact terms, names, acronyms, and multilingual compounds.
4. **Citation drift** - return structured evidence and store structured artifact references.
5. **Non-idempotent ingestion** - use deterministic IDs, manifests, and upserts.

## Implications for Roadmap

### Phase 1: Corpus Discovery and Ingestion Design
**Rationale:** Every downstream technical choice depends on the unknown archive shape.
**Delivers:** Corpus Report plus proposed ingestion, metadata, chunking, retrieval, and embedding design.
**Addresses:** Corpus-first requirement, embedding decision, parser/OCR decision.
**Avoids:** Premature schema and embedding lock-in.

### Phase 2: Template and Cloud Foundation
**Rationale:** The app baseline and environment must exist before integrating retrieval tools.
**Delivers:** Vercel Chatbot template, env validation, Neon/Qdrant/Gemini configuration stubs, test setup.
**Uses:** Next.js App Router, AI SDK, shadcn/ui, Tailwind, Neon, Qdrant Cloud.

### Phase 3: Ingestion and Hybrid Retrieval Engine
**Rationale:** Chat quality depends on a reliable, idempotent prior-work index.
**Delivers:** Ingestion CLI, Qdrant collection, dense+sparse vectors, payload indexes, retrieval wrapper, unit tests.
**Implements:** Corpus-derived design confirmed after Phase 1.

### Phase 4: Chat Tools, Ideation Flows, Proposal Artifact
**Rationale:** Once retrieval works, expose it through user-facing thesis ideation flows.
**Delivers:** AI SDK tools, Spark-to-ideas, Build-on-top, grounding prompt, `thesis-proposal` artifact, E2E tests.
**Addresses:** Core user value.

### Phase Ordering Rationale

- Corpus discovery comes first because embedding model, parser, schema, and chunking choices are otherwise guesswork.
- Template setup comes before retrieval integration so auth, persistence, and artifact conventions are available.
- Retrieval engine comes before chat behavior so tools can return structured evidence.
- Proposal artifact lands with chat flows because artifact references depend on retrieval citations.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Parser/OCR tooling depends on actual archive file types.
- **Phase 3:** Sparse vector generation and multilingual tokenization need validation against corpus languages.
- **Phase 4:** Artifact implementation should inspect the exact Vercel Chatbot template version after clone.

Phases with standard patterns:
- **Phase 2:** Template setup should mostly follow the current template and provider docs.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Main stack is prescribed by PRD and supported by current docs; exact versions wait for template clone. |
| Features | HIGH | PRD defines modes, artifact, retrieval shape, and v1 done criteria clearly. |
| Architecture | MEDIUM | Component boundaries are clear; parser and schema details depend on corpus discovery. |
| Pitfalls | MEDIUM-HIGH | Risks are direct consequences of corpus-first retrieval systems and cloud chat architecture. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- Archive location and contents: Phase 1 must locate and inspect the actual archive.
- Embedding model: decide after visual/text density is measured.
- Metadata schema: propose from real evidence and confirm with user.
- Build-on-top UX: confirm browse/search/paste-id behavior.
- Auth scope: confirm open student access versus SSO or restricted pilot.
- Idea-quality rubric: propose and confirm before treating outputs as "good."

## Sources

### Primary (HIGH confidence)

- `PRD.md` - seed brief, modes, constraints, definition of done.
- Context7 `/vercel/ai` - AI SDK tools, streams, multi-step tool calling.
- Context7 `/websites/qdrant_tech` - Qdrant hybrid search, sparse vectors, RRF.
- Context7 `/vercel/next.js` - App Router concepts.
- Google AI official docs: https://ai.google.dev/gemini-api/docs/embeddings
- Google AI official docs: https://ai.google.dev/gemini-api/docs/models/gemini-embedding-2-preview

### Secondary (MEDIUM confidence)

- Inferences from the Vercel Chatbot template requirement in `PRD.md`; exact implementation details should be verified after cloning the template.

---
*Research completed: 2026-06-30*
*Ready for roadmap: yes*
