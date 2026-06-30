---
status: complete
created: 2026-07-01
completed: 2026-07-01
---

# Quick Task: SEO, Gateway Catalog, and Technical README

## Goal

Improve production readiness and presentation for the German Diplomarbeit idea engine: use the HTL Donaustadt logo, improve SEO metadata, make model selection prefer Gemini first while exposing the live AI Gateway catalog, and replace the README with a concise technical AI/ML pipeline overview.

## Plan

- Add local logo assets for metadata, app icons, manifest, and visible preview branding.
- Update Next.js metadata for German education and archive-grounded thesis ideation.
- Make `/api/models` check Gateway credits, fetch available Gateway models, and fall back to raw Gateway config metadata if the SDK helper fails.
- Keep Gemini first and default when Gateway usage is unavailable, and use Sonnet 5 as the default when Gateway credits are available.
- Replace the README with a compact AI/ML pipeline document and Mermaid diagrams.
- Verify env, retrieval, Gateway metadata, lint, types, unit tests, and production build.