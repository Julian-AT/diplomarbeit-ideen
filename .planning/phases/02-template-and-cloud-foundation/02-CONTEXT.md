# Phase 2 Context: Template and Cloud Foundation

## Goal

Establish the Vercel Chatbot baseline and the configuration/test harness needed before ingestion, retrieval, and chat-tool work.

## Inputs

- Phase 1 approval manifest: `.planning/corpus/APPROVAL-MANIFEST.json` approved on 2026-06-30.
- Corpus report: high visual density, 12 OCR candidates, mixed German/English evidence, Qdrant hybrid retrieval approved.
- Template source: `https://github.com/vercel/ai-chatbot` pinned at `2becdb4a56e7683ae08aef927cec1c6c52dfad5e`.
- Project PRD: `PRD.md` provided by user and left unmodified.

## Documentation Checked

- Context7 `/vercel/next.js`: App Router foundation, route handlers, env loading, typed env context.
- Context7 `/vercel/ai`: AI SDK 6 `streamText`, UI message streams, tool patterns, multi-step tool calls.
- Context7 `/qdrant/qdrant-js`: `QdrantClient` dependency and environment-based `url`/`apiKey` setup.
- Context7 `/websites/ai_google_dev_gemini-api`: `GEMINI_API_KEY`, `gemini-embedding-2-preview`, and `gemini-embedding-001` embedding model identifiers.
- Context7 `/biomejs/biome`: current Biome config validates rule keys and rejects unknown rule overrides.

## Decisions

- Import the official template as source, excluding only `.git` and manually merging `.gitignore`.
- Keep the template's auth, persistence, multimodal input, artifacts, chat route, and code execution baseline intact.
- Add `@qdrant/js-client-rest` now so Phase 3 can implement retrieval against the approved Qdrant direction.
- Add `vitest` for focused unit checks and `cross-env` so Playwright commands work on Windows and CI.
- Add an env validation library plus CLI that can validate `.env.example` with placeholders and `.env.local` strictly.
- Keep Gemini's default setup model as `gemini-embedding-2-preview`; preserve `gemini-embedding-001` as the text-only fallback choice for Phase 3.

## Verification Boundary

No real `.env.local` secrets are present in this repo. Full dev server, migration, and E2E execution require user-provisioned Vercel/Neon/Redis/Blob/AI Gateway/Qdrant/Gemini credentials. Phase 2 verifies offline-safe command paths and strict validation behavior.
