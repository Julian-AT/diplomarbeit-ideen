---
status: complete
completed: 2026-07-01
---

# Summary: SEO, Gateway Catalog, and Technical README

## Completed

- Downloaded and committed the HTL Donaustadt logo as `public/images/htl-donaustadt-logo.png`, `app/icon.png`, and `app/apple-icon.png`.
- Added German SEO metadata, Open Graph and Twitter image metadata, app manifest, `lang="de"`, and visible preview branding.
- Removed remote `next/font/google` usage so production builds do not depend on Google Fonts fetches.
- Switched `pnpm build` to `next build --webpack` to avoid Windows Turbopack file-lock failures.
- Changed `/api/models` to check AI Gateway credits, keep direct Gemini first, use Sonnet 5 as the Gateway default only when credits are available, and expose the full live Gateway language-model catalog through a raw config fallback when the SDK metadata parser fails.
- Relaxed `GATEWAY_CHAT_MODEL` validation to accept dynamic provider/model IDs.
- Replaced the README with a short technical AI/ML pipeline description and Mermaid diagrams.

## Verification

- `pnpm env:check` passed.
- `pnpm test:unit` passed: 7 files, 24 tests.
- `pnpm typecheck` passed.
- `pnpm check` passed.
- `pnpm prod:check` passed: Postgres ok, Qdrant `diplomarbeiten` has 2,747 points, both German smoke queries returned 3 Qdrant results.
- Gateway metadata fallback check returned 201 parsed language models, with `gemini-3.5-flash` first and `anthropic/claude-sonnet-5` second.
- `pnpm build` passed with `next build --webpack`.