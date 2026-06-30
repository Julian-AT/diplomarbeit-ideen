# Thesis Idea Engine

Cloud-hosted chatbot for software-engineering students who need realistic, cited diploma-thesis ideas grounded in a prior thesis archive.

This repository is based on the Vercel Chatbot template imported from `vercel/ai-chatbot` at commit `2becdb4a56e7683ae08aef927cec1c6c52dfad5e`. The project keeps the template's Next.js App Router app, AI SDK chat flow, Auth.js integration, persistence, artifacts system, and Playwright setup, then adds the corpus-grounded prior-work engine on top.

## Phase 2 Foundation

The current foundation includes:

- Next.js 16 App Router and AI SDK 6 from the official chatbot template.
- Neon/Postgres, Redis, Vercel Blob, Auth.js, and Vercel AI Gateway env slots from the template.
- Qdrant Cloud and Gemini embedding env slots for the thesis archive retrieval engine.
- A Windows-safe Playwright command and a focused Vitest unit-test command.
- An env validation CLI that can check `.env.example` without real secrets and `.env.local` strictly before runtime cloud calls.

## Local Setup

```bash
pnpm install
pnpm env:check:example
```

Create `.env.local` from `.env.example`, fill real cloud secrets, then run:

```bash
pnpm env:check
pnpm db:migrate
pnpm dev
```

The app runs on `http://localhost:3000` once the required Vercel/Neon/Redis/Blob/AI Gateway/Qdrant/Gemini variables are present.

## Verification Commands

```bash
pnpm env:check:example
pnpm test:unit
pnpm typecheck
pnpm test:e2e
```

`pnpm test:e2e` starts the Next.js dev server through Playwright and requires a complete local environment. Without real cloud credentials, use `pnpm env:check:example` and `pnpm test:unit` for offline verification.

## Corpus Artifacts

Corpus reports and approval artifacts live under `.planning/corpus/`. The raw archive extraction and original zip are intentionally ignored by git.