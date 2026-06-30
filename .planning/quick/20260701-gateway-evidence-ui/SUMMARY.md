---
status: complete
completed: 2026-07-01
---

# Summary: Gateway Fallback and Evidence UX

## Completed

- Restored optional AI Gateway support while keeping direct `@ai-sdk/google` Gemini 3.5 Flash available.
- Added dynamic `/api/models` defaults: Sonnet 5 via `anthropic/claude-sonnet-5` when Gateway credentials exist, direct Gemini otherwise.
- Updated German homepage/greeting suggestions for Diplomarbeit ideation over the archive.
- Replaced the Vercel deploy CTA with a GitHub repository button.
- Added source-card rendering for prior-work tools and an authenticated `/api/prior-work/source` evidence preview page.
- Tightened system/tool prompts to reject generic archived-project catalogs that are not grounded in retrieved vector DB content.

## Verification

- `pnpm fix` passed.
- `pnpm typecheck` passed.
- `pnpm test:unit` passed: 7 files, 21 tests.
- `pnpm check` passed.
- `pnpm env:check:example` passed.
- `pnpm env:check` passed, loading `.env`.
- `pnpm prod:check -- --min-points 2000` passed: Postgres ok, Qdrant `diplomarbeiten` has 2,747 points, both German smoke queries returned Qdrant results.
- `pnpm build` passed outside the sandbox after sandboxed build output cleanup hit EPERM.
- `pnpm test:e2e --list` passed: 26 tests listed.