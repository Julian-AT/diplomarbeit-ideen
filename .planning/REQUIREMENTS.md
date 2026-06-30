# Requirements: Thesis Idea Engine

**Defined:** 2026-06-30
**Core Value:** Students can get creative but feasible thesis proposals that are grounded in, cite, and build on real prior theses from the archive.

## v1 Requirements

### Corpus Discovery

- [x] **CORP-01**: User can run a discovery workflow that locates and unpacks the thesis archive from the project directory.
- [x] **CORP-02**: User can view an inventory of archive file types, counts, languages, folder structure, naming conventions, and existing metadata.
- [x] **CORP-03**: User can view a content characterization covering text density, visual/slide/diagram density, structure consistency, OCR needs, and missing metadata.
- [x] **CORP-04**: User can review a Corpus Report with proposed ingestion, metadata, chunking, retrieval, and embedding design derived from the real corpus.
- [x] **CORP-05**: User can approve or request changes to the proposed corpus design before full indexing begins.

### Foundation

- [ ] **FND-01**: Developer can set up the Vercel Chatbot template while preserving auth, persistence, multimodal input, artifacts, and in-browser code execution.
- [ ] **FND-02**: Developer can validate required environment configuration for Vercel, Qdrant Cloud, Neon Postgres, and Gemini embeddings before runtime or ingestion work.
- [ ] **FND-03**: Developer can run focused Vitest and Playwright test commands in the project.

### Retrieval Engine

- [ ] **RETR-01**: Developer can run an idempotent ingestion CLI after the corpus design is approved.
- [ ] **RETR-02**: The Qdrant collection stores chunk-level points with dense vectors, sparse vectors, and corpus-derived payload metadata.
- [ ] **RETR-03**: The retrieval wrapper can execute hybrid dense+sparse searches with RRF fusion and confirmed payload filters.
- [ ] **RETR-04**: Retrieval results include structured provenance with thesis ID, chunk ID, title, source path, excerpt, and any available metadata.

### Chat Flows

- [ ] **CHAT-01**: Student can use Spark-to-ideas mode with a vague or blank starting point and receive novel, realistic thesis directions grounded in cited prior work.
- [ ] **CHAT-02**: Student can use Build-on-top mode by selecting or searching an existing thesis and receive concrete cited extensions or follow-ups.
- [ ] **CHAT-03**: Chat can call server-side AI SDK tools for prior-work search, thesis lookup, and extension discovery.
- [ ] **CHAT-04**: Chat surfaces uncertainty or corpus gaps when retrieved evidence does not support a requested direction.

### Thesis Proposal Artifact

- [ ] **ART-01**: Student can create a `thesis-proposal` artifact containing title, abstract, related work, scope, methodology, deliverables, risks, and references.
- [ ] **ART-02**: Student can edit and version a `thesis-proposal` artifact while preserving citations to real thesis evidence.

### Quality

- [ ] **QUAL-01**: Developer can run unit tests covering chunking, metadata extraction, Qdrant wrapper behavior, and hybrid retrieval/fusion logic.
- [ ] **QUAL-02**: Developer can run E2E tests covering Spark-to-ideas, Build-on-top, and proposal artifact editing/versioning.
- [ ] **QUAL-03**: Developer can run or apply a lightweight idea-quality check covering groundedness, novelty, feasibility, scope, and citation quality.

## v2 Requirements

### Access and Deployment

- **AUTH-01**: User can authenticate through school SSO if the school requires restricted student access.
- **DEPL-01**: Developer can deploy a fully self-hosted or offline variant if cloud hosting becomes unacceptable.

### Corpus Operations

- **CORP-06**: Administrator can browse and manage indexed thesis records through a dedicated admin UI.
- **CORP-07**: Administrator can schedule or trigger incremental archive updates after v1 indexing exists.

### Product Quality

- **EVAL-01**: Product owner can review aggregate proposal-quality metrics across anonymized sessions.
- **UX-01**: Student can compare multiple generated thesis directions side by side.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Fixed metadata schema before Phase 1 | The schema must be derived from the real archive. |
| Final embedding model before Phase 1 | Text-only versus multimodal depends on corpus visual density and parsing needs. |
| Dense-only retrieval | Exact names, titles, acronyms, and multilingual terms require sparse retrieval too. |
| Generic uncited brainstorming | The core value requires grounded, cited ideas. |
| Full self-hosted/offline v1 | Cloud-first is explicitly scoped for speed. |
| Exhaustive coverage targets | Tests should be focused on ingestion/retrieval and the core flows. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CORP-01 | Phase 1 | Complete |
| CORP-02 | Phase 1 | Complete |
| CORP-03 | Phase 1 | Complete |
| CORP-04 | Phase 1 | Complete |
| CORP-05 | Phase 1 | Complete |
| FND-01 | Phase 2 | Pending |
| FND-02 | Phase 2 | Pending |
| FND-03 | Phase 2 | Pending |
| RETR-01 | Phase 3 | Pending |
| RETR-02 | Phase 3 | Pending |
| RETR-03 | Phase 3 | Pending |
| RETR-04 | Phase 3 | Pending |
| CHAT-01 | Phase 4 | Pending |
| CHAT-02 | Phase 4 | Pending |
| CHAT-03 | Phase 4 | Pending |
| CHAT-04 | Phase 4 | Pending |
| ART-01 | Phase 4 | Pending |
| ART-02 | Phase 4 | Pending |
| QUAL-01 | Phase 3 | Pending |
| QUAL-02 | Phase 4 | Pending |
| QUAL-03 | Phase 4 | Pending |

**Coverage:**

- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-06-30*
*Last updated: 2026-06-30 after roadmap creation*
