# Local Setup

## Required Services

The v1 foundation is cloud-first:

- Vercel for hosting and environment management.
- Neon Postgres through `POSTGRES_URL` for template persistence.
- Redis through `REDIS_URL` for resumable stream support.
- Vercel Blob through `BLOB_READ_WRITE_TOKEN` for files.
- Vercel AI Gateway through `AI_GATEWAY_API_KEY` for chat models during local development.
- Qdrant Cloud through `QDRANT_URL`, `QDRANT_API_KEY`, and `QDRANT_COLLECTION` for hybrid retrieval.
- Gemini API through `GEMINI_API_KEY` and `GEMINI_EMBEDDING_MODEL` for embeddings.

## Environment Contract

Copy `.env.example` to `.env.local` and fill the placeholders.

`GEMINI_EMBEDDING_MODEL` defaults to `gemini-embedding-2-preview` because Phase 1 found high visual density and approved evaluating multimodal embeddings first. Use `gemini-embedding-001` only if the later ingestion phase confirms that text-only extraction is sufficient and the index will be built in that vector space.

Run these checks before starting runtime code that calls cloud services:

```bash
pnpm env:check:example
pnpm env:check
```

`pnpm env:check:example` validates that the committed example has the right keys and model identifiers while accepting placeholder secrets. `pnpm env:check` validates `.env.local` strictly.

## Development Commands

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Use `pnpm test:unit` for focused unit tests. Use `pnpm test:e2e` for Playwright once `.env.local` contains real service credentials.

## Imported Template

Template source: `https://github.com/vercel/ai-chatbot`

Pinned commit: `2becdb4a56e7683ae08aef927cec1c6c52dfad5e`

The import intentionally keeps the template's auth, persistence, chat route, artifacts system, multimodal input, and in-browser code execution so later phases can add the prior-work tools and `thesis-proposal` artifact without rebuilding the baseline app.