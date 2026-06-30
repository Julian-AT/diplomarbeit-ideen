# Phase 4 Context: Grounded Ideation Flows and Proposal Artifact

## Goal

Expose the retrieval engine through chat tools, make grounded thesis ideation the default behavior, and add an editable cited proposal artifact.

## Inputs

- Phase 3 retrieval wrappers, local chunk index, and dry-run corpus output.
- Vercel Chatbot template artifact system and AI SDK chat route.
- Approved corpus design and citation payloads from `.planning/corpus/APPROVAL-MANIFEST.json`.
- Cloud env contract for Qdrant/Gemini from `.env.example`.

## Documentation Checked

- Context7 `/vercel/ai`: AI SDK tool and streaming patterns from prior foundation work.
- Context7 `/qdrant/qdrant-js` and Qdrant docs: hybrid query and payload filter behavior from Phase 3.
- Context7 `/websites/ai_google_dev_gemini-api`: embedding model and API contract from Phase 3.
- Context7 `/microsoft/playwright`: `test.skip` and `--list` behavior for cloud-gated E2E coverage.

## Decisions

- Add three server-side prior-work tools: `searchPriorWork`, `getThesisById`, and `findThesisExtensions`.
- Let tools use Qdrant/Gemini when the full env contract is valid, otherwise fall back to the ignored local chunk index created by dry-run ingestion.
- Require prior-work tool use in the prompt before thesis proposals or build-on-top recommendations.
- Register `thesis-proposal` as a first-class artifact kind with streaming Markdown content, editing/versioning support, and citation-preserving toolbar actions.
- Keep the idea-quality check deterministic and source-level: it checks proposal structure, citations, source paths, novelty/gap framing, and feasibility signals.
- Gate full Playwright thesis-flow execution behind `E2E_FULL_CLOUD=1` because runtime chat, auth, model calls, and retrieval require real cloud credentials.

## Verification Boundary

Source-level integration is verified locally. Full runtime UAT for AI responses, Qdrant Cloud retrieval, and proposal artifact generation requires complete `.env.local` credentials and a live dev server.