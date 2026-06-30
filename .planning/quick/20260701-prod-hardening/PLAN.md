---
status: complete
created: 2026-07-01
completed: 2026-07-01
---

# Quick Task: Production Gemini and Qdrant Hardening

## Goal

Switch production chat away from Vercel AI Gateway to direct Gemini 3.5 Flash via `@ai-sdk/google`, make retrieval more German-aware for Diplomarbeit ideation, and verify live Postgres/Qdrant production data setup.

## Plan

- Replace Gateway-backed production provider with direct Gemini Interactions provider.
- Update env validation/docs/scripts for the Google-only chat path and `.env` fallback.
- Improve German sparse tokenization and German thesis query expansion.
- Add Qdrant scroll/count support, extra payload indexes, and production smoke check.
- Run migrations, real corpus ingestion, production smoke checks, and production build.
