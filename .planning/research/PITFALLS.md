# Pitfalls Research

**Domain:** AI-assisted thesis ideation over a prior-work corpus
**Researched:** 2026-06-30
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### 1. Locking the Embedding Model Too Early

**Risk:** Dense vector spaces are incompatible. Choosing text-only versus multimodal before seeing the archive can force a full re-index later.

**Warning signs:**
- Code creates the Qdrant collection before the Corpus Report is reviewed.
- Embedding dimensions are hard-coded before file/content inventory.
- Visual PDFs/slides are ignored because text extraction was assumed.

**Prevention:**
- Phase 1 must produce a Corpus Report and embedding recommendation.
- Keep collection creation behind user-confirmed design.
- Make re-indexing implications explicit in the report.

### 2. Weak Metadata and Filters

**Risk:** Retrieval quality depends on filtering and citation context. Missing fields make Build-on-top and proposal references brittle.

**Warning signs:**
- Payload contains only raw text and file path.
- No stable thesis ID or chunk ID.
- No plan for title/year/student/topic/language fields where available.

**Prevention:**
- Derive schema from actual manifests, filenames, frontmatter, title pages, or folder conventions.
- Payload-index the most selective confirmed fields.
- Store provenance for every extracted field.

### 3. Dense-Only Retrieval

**Risk:** Semantic search can miss exact titles, people, product names, abbreviations, and German compounds.

**Warning signs:**
- Query wrapper only sends one dense vector.
- No sparse vector generation or lexical fallback.
- Build-on-top cannot reliably find a known thesis.

**Prevention:**
- Use Qdrant named dense and sparse vectors.
- Fuse dense and sparse prefetch results with RRF.
- Test exact-title and exact-term queries.

### 4. Citation Drift

**Risk:** The chat may cite a thesis while making claims not supported by the retrieved chunks.

**Warning signs:**
- Tool returns large unstructured text without citation IDs.
- Prompt says "cite sources" but code does not enforce evidence structure.
- Artifact references are free-form strings.

**Prevention:**
- Retrieval tools return structured evidence with thesis ID, chunk ID, title, source path, and excerpt.
- Proposal artifact stores references as structured citation objects.
- E2E tests check that generated proposals include citations tied to retrieval results.

### 5. Generic Ideas Instead of Corpus-Aware Novelty

**Risk:** The app becomes a generic topic generator, losing its core value.

**Warning signs:**
- Spark mode works even when retrieval is disabled.
- Outputs lack "building on prior work" reasoning.
- No novelty or feasibility checklist exists.

**Prevention:**
- System prompt requires proposals to cite prior work and name the extension path.
- Add a lightweight idea-quality rubric.
- Include fixtures where blank-start prompts must still use corpus evidence.

### 6. Non-Idempotent Ingestion

**Risk:** Re-running ingestion duplicates points, changes IDs, or leaves stale chunks.

**Warning signs:**
- Point IDs are random.
- No manifest records archive fingerprint, parser version, embedding model, or chunking strategy.
- Upserts are not used.

**Prevention:**
- Use deterministic IDs from thesis identity plus chunk position/version.
- Store ingestion manifest and design version.
- Add unit tests for repeated ingestion.

### 7. Cloud Secret Leakage

**Risk:** Qdrant, Neon, or embedding credentials can leak through client code.

**Warning signs:**
- Qdrant client imported in client components.
- `NEXT_PUBLIC_` used for private service keys.
- Browser calls embedding provider directly.

**Prevention:**
- Keep retrieval, ingestion, and embeddings server-side.
- Validate env vars and secret names.
- Add review checklist for client/server boundaries.

## Phase Mapping

| Pitfall | Phase That Must Address It |
|---------|----------------------------|
| Embedding model too early | Phase 1 |
| Weak metadata and filters | Phase 1, Phase 3 |
| Dense-only retrieval | Phase 3 |
| Citation drift | Phase 4 |
| Generic ideas | Phase 4 |
| Non-idempotent ingestion | Phase 3 |
| Secret leakage | Phase 2, Phase 3 |

## Sources

- `PRD.md` - corpus-first warning and quality constraints.
- Context7 `/websites/qdrant_tech` - hybrid search and payload filtering implications.
- Context7 `/vercel/ai` - tool schemas and server execution patterns.

---
*Pitfalls research for: Thesis Idea Engine*
*Researched: 2026-06-30*
