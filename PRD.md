# PRD — Thesis Idea Engine

> The seed brief for GSD's `/gsd-new-project`. Deliberately light on implementation detail: GSD's agents should **explore the data, propose a design, and ASK the user** before locking decisions. Anywhere this doc says *open*, GSD must raise a question rather than assume.

---

## 1. Summary

A cloud-hosted chatbot that helps SWE-school students find a strong diploma-thesis topic, grounded in the school's full archive of past theses. Two modes:

1. **Spark → ideas** — student types a rough idea (or has none); the app proposes creative-but-realistic thesis directions grounded in, and building on, prior theses.
2. **Build-on-top** — student picks/searches an existing thesis; the app proposes concrete extensions and follow-ups.

The differentiator is a **prior-work engine** over the whole corpus (Qdrant) that the chat calls as a tool — not a generic RAG bot.

Built on the Vercel **Chatbot** template (Next.js App Router, AI SDK, shadcn/ui, Tailwind): keep its auth, persistence, multimodal input, **Artifacts** system, and in-browser code execution. We add one custom artifact and the retrieval engine.

## 2. Phase 0 (most important): understand the corpus — explore, don't assume

The single most important first deliverable. The thesis archive is provided as a **zip/archive in the project directory**. The agents must:

- **Locate and unpack it**, then inventory what's actually inside: file types, counts, languages, folder structure, naming conventions, and any existing metadata/manifests.
- **Characterize the content**: how text-heavy vs. figure/diagram/slide-heavy it is; how consistent the structure is; what natural metadata exists (or is missing).
- Produce a short **Corpus Report** plus a **proposed ingestion & metadata design** — chunking strategy, which fields are realistically extractable, dense + sparse vector strategy, and a recommended embedding model.
- **Do not assume** the schema, fields, formats, or languages. Derive everything from the real data. Where uncertain, **ask the user.**

Nothing about the data's contents is specified in this brief on purpose — it is unknown until explored. Discovery drives every downstream design choice.

## 3. The two ideation modes

**Mode A — Spark → ideas (must be genuinely creative).** When the student has only a vague spark — or nothing at all — the engine should still produce *novel, realistic* thesis directions by reasoning across the corpus itself: spotting under-explored areas, combining themes from different prior theses, and extending open threads. The model does the creative thinking; retrieval keeps it honest and grounded. Every proposal must stay tied to and build on what already exists (cited), so ideas come out original **and** feasible rather than generic.

**Mode B — Build-on-top.** Select/search an existing thesis → propose concrete extensions and follow-ups grounded in that project, its nearest neighbours, and any open/"future work" threads it leaves behind.

## 4. Retrieval engine (shape, not schema)

- **Qdrant** collection, chunk-level points, **hybrid**: a **dense** vector (hosted embedding API) plus a **sparse BM25** vector (exact tech terms, names, multilingual/compound words), fused (RRF) via Qdrant's Query API.
- **Metadata/payload schema: to be designed from the corpus in Phase 0**, then payload-indexed on the most selective filter fields for fast filtered search. Fields are intentionally **not** prescribed here.
- **Embedding model: open** (see §7) — chosen after Phase 0 shows how visual the corpus is. Hybrid + sparse stays regardless.
- Exposed to the chat as AI SDK **tools** (search prior work / get-by-id / find-extensions). System prompt: always ground + cite, and surface gaps to keep ideas novel.

## 5. Custom artifact: `thesis-proposal`

New `artifacts/thesis-proposal/` (`client.tsx` + `server.ts` via `createDocumentHandler`), registered in `artifactDefinitions`. Renders an editable, versioned proposal with citations to real theses. A reasonable starting structure — title, abstract, related work, scope, methodology, deliverables, risks, references — to be refined during build.

## 6. Stack & hosting (cloud for now)

- **Hosting:** Vercel. **Vector DB:** Qdrant Cloud. **Persistence:** Neon Postgres. **Embeddings:** hosted Gemini embedding API (exact model open, §7). **Chat LLM:** pluggable via the AI SDK.
- The user provisions Vercel / Qdrant / Neon. Fully self-hosted/offline is a possible *later* phase, not now.

## 7. Open decisions — GSD must ASK, not assume

1. **Embedding model.** `gemini-embedding-2` (natively multimodal, preview, ~$0.20/M, one index for text+figures, forward-compatible, Matryoshka-truncatable to 768/1536) vs `gemini-embedding-001` (text-only, GA, ~$0.15/M). Decide **after** Phase 0 shows how figure/slide-heavy the corpus is. Commit once — the two vector spaces are incompatible.
2. **Metadata schema & chunking.** Propose from the corpus; confirm with the user before indexing.
3. **Corpus languages & parsing needs** (OCR? slide extraction? mixed DE/EN?) — derive from Phase 0.
4. **Build-on selection UX** — browse a list, search, or paste an id? Confirm.
5. **Auth scope** — open to all students, or SSO? Confirm.
6. **Idea-quality bar** — how do we judge a "good" proposal? Propose a lightweight eval/check.

## 8. Quality & testing (lean — speed is the priority)

Vitest unit tests for the ingestion/retrieval logic once its shape is agreed (chunker, metadata extraction, Qdrant wrapper, fusion). Reuse the template's Playwright for the two chat flows + the artifact. Keep coverage focused, not exhaustive.

## 9. Definition of done (v1)

- [ ] Corpus Report + an agreed ingestion/metadata/embedding design.
- [ ] Full corpus indexed; re-running ingestion is idempotent.
- [ ] Both modes working, grounded and cited; spark produces novel-yet-realistic ideas even from a blank start.
- [ ] `thesis-proposal` artifact opens, edits, and versions.
- [ ] Unit tests for the engine; E2E for the flows.

## 10. Suggested sequence (GSD will produce the real roadmap)

1. **Explore the corpus (Phase 0)** → Corpus Report + ingestion/metadata/embedding proposal → **ask the user to confirm.**
2. Clone template + wire cloud env (Vercel / Qdrant / Neon / embeddings) + Vitest.
3. Engine: collection + ingestion CLI + hybrid query + unit tests.
4. Tools + grounding prompt + both flows + `thesis-proposal` artifact + E2E.
