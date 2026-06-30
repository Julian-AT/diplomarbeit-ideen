---
status: complete
created: 2026-07-01
completed: 2026-07-01
---

# Quick Task: Gateway Fallback and Evidence UX

## Goal

Restore optional Vercel AI Gateway support without making it required, select Sonnet 5 as the Gateway-backed default when Gateway credentials are available, and improve the German archive-grounded Diplomarbeit idea experience.

## Plan

- Add dynamic model routing for direct Gemini and optional AI Gateway models.
- Update German onboarding copy and repository header link.
- Tighten prompts against generic ungrounded idea catalogs.
- Render prior-work tool outputs as source cards with links to an authenticated evidence preview.
- Validate env, Qdrant production smoke, unit/type/lint checks, E2E discovery, and production build.