---
status: complete
completed: 2026-07-01
---

# Summary: Production Gemini and Qdrant Hardening

## Completed

- Switched production chat/title models to direct `@ai-sdk/google` Gemini Interactions using `gemini-3.5-flash`.
- Removed AI Gateway from the required env contract and production route/provider path.
- Added `.env.local` then `.env` fallback for validation, migration, ingestion, and production smoke scripts.
- Added German-aware sparse token normalization, umlaut folding, token splitting, and German Diplomarbeit query expansion.
- Added Qdrant scroll/count helpers, extra payload indexes, and Qdrant-backed build-on-top context retrieval.
- Added `pnpm prod:check` for env, Postgres, Qdrant count, and German retrieval smoke queries.
- Migrated Postgres, extracted the corpus, and upserted 2,747 Qdrant points into the `diplomarbeiten` collection with 3,072-dimensional Gemini embeddings.

## Verification

- `pnpm typecheck` passed.
- `pnpm test:unit` passed: 6 files, 17 tests.
- `pnpm check` passed.
- `pnpm env:check:example` passed.
- `pnpm env:check` passed, loading `.env`.
- `pnpm db:migrate` passed.
- `pnpm corpus:extract` passed: 62 documents, 24 non-text skipped, 0 errors.
- `pnpm corpus:ingest` passed: 2,747 chunks upserted, 3,072 dense dimensions.
- `pnpm prod:check -- --min-points 2000` passed: Postgres ok, Qdrant `diplomarbeiten` has 2,747 points, both German smoke queries returned 3 Qdrant results.
- `pnpm build` passed outside sandbox after sandboxed build failed to fetch Google Fonts.
- `pnpm test:e2e --list` passed: 26 tests listed.

## Caveat

A local production-server smoke attempt was not reliable under the Windows sandbox process launcher. No listener remains on the temporary port. Production build plus backend production smoke passed.
