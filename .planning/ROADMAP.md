# Roadmap: Thesis Idea Engine

## Overview

Build the product in four vertical MVP phases. Start by discovering the real corpus and confirming irreversible ingestion choices, then establish the Vercel Chatbot foundation, implement the hybrid prior-work engine, and finally expose grounded thesis ideation through chat tools and a cited proposal artifact.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Corpus Discovery and Design Approval** - Inspect the archive and confirm the ingestion/retrieval design before indexing. (completed 2026-06-30)
- [x] **Phase 2: Template and Cloud Foundation** - Set up the Vercel Chatbot baseline, cloud configuration, and test harness. (completed 2026-06-30)
- [x] **Phase 3: Ingestion and Hybrid Retrieval Engine** - Build idempotent corpus indexing and Qdrant hybrid retrieval. (completed 2026-06-30)
- [x] **Phase 4: Grounded Ideation Flows and Proposal Artifact** - Deliver both chat modes, citations, quality checks, and the custom artifact. (completed 2026-06-30)

## Phase Details

### Phase 1: Corpus Discovery and Design Approval

**Goal**: Produce a Corpus Report and user-approved ingestion, metadata, chunking, retrieval, and embedding design from the real archive.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: CORP-01, CORP-02, CORP-03, CORP-04, CORP-05
**UI hint**: no
**Success Criteria** (what must be TRUE):

  1. User can run discovery and see which archive was found and unpacked.
  2. User can review inventory counts, languages, file types, folder conventions, naming conventions, and metadata evidence.
  3. User can review content characterization including visual density, OCR needs, structural consistency, and missing metadata.
  4. User can approve or request changes to the proposed ingestion, metadata, chunking, retrieval, and embedding design before indexing.

**Plans**: 3/3 plans executed

Plans:

- [x] 01-01: Locate archive, unpack safely, and inventory files.
- [x] 01-02: Characterize content, language, metadata, and parsing/OCR needs.
- [x] 01-03: Write Corpus Report and proposed ingestion design with approval checkpoint.

### Phase 2: Template and Cloud Foundation

**Goal**: Establish the application baseline and configuration needed for retrieval and chat work.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: FND-01, FND-02, FND-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):

  1. Developer can run the Vercel Chatbot template locally with auth, persistence, multimodal input, artifacts, and code execution preserved.
  2. Developer can validate Vercel, Qdrant Cloud, Neon Postgres, and Gemini embedding environment configuration before runtime calls.
  3. Developer can run the focused Vitest and Playwright commands.

**Plans**: 3 plans

Plans:

- [x] 02-01: Clone/adapt Vercel Chatbot template and preserve baseline features.
- [x] 02-02: Add cloud environment validation and local setup documentation.
- [x] 02-03: Establish Vitest and Playwright command baseline.

### Phase 3: Ingestion and Hybrid Retrieval Engine

**Goal**: Index the confirmed corpus design and provide reliable cited hybrid retrieval.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: RETR-01, RETR-02, RETR-03, RETR-04, QUAL-01
**UI hint**: no
**Success Criteria** (what must be TRUE):

  1. Developer can run ingestion repeatedly without duplicate or unstable Qdrant points.
  2. Qdrant stores chunk-level dense vectors, sparse vectors, and confirmed payload metadata.
  3. Retrieval can combine dense and sparse results with RRF and apply confirmed filters.
  4. Retrieval results include structured citation provenance suitable for chat and artifacts.
  5. Unit tests cover chunking, metadata extraction, Qdrant wrapper behavior, and fusion logic.

**Plans**: 3 plans

Plans:

- [x] 03-01: Implement corpus-derived extraction, chunking, metadata, and deterministic IDs.
- [x] 03-02: Create Qdrant collection, sparse/dense indexing, payload indexes, and idempotent upserts.
- [x] 03-03: Implement retrieval wrapper and focused unit tests.

### Phase 4: Grounded Ideation Flows and Proposal Artifact

**Goal**: Deliver the student-facing ideation experience with cited proposals and verification.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, ART-01, ART-02, QUAL-02, QUAL-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):

  1. Student can use Spark-to-ideas with vague or blank input and receive novel, realistic, cited thesis directions.
  2. Student can use Build-on-top by selecting or searching a thesis and receive concrete cited extensions.
  3. Chat uses server-side tools for prior-work search, thesis lookup, and extension discovery.
  4. Chat surfaces gaps and uncertainty when evidence is weak or missing.
  5. Student can create, edit, and version a `thesis-proposal` artifact with preserved citations.
  6. E2E tests cover both chat flows and artifact editing/versioning, and the idea-quality check can be applied.

**Plans**: 3/3 plans executed

Plans:

- [x] 04-01: Implement AI SDK tools and grounding prompt for both chat modes.
- [x] 04-02: Implement `thesis-proposal` artifact and structured citation persistence.
- [x] 04-03: Add E2E tests and idea-quality checks.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Corpus Discovery and Design Approval | 3/3 | Complete    | 2026-06-30 |
| 2. Template and Cloud Foundation | 3/3 | Complete    | 2026-06-30 |
| 3. Ingestion and Hybrid Retrieval Engine | 3/3 | Complete    | 2026-06-30 |
| 4. Grounded Ideation Flows and Proposal Artifact | 3/3 | Complete    | 2026-06-30 |
