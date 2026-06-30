# Local Setup

## Required Services

The v1 foundation is cloud-first:

- Vercel for hosting and environment management.
- Neon Postgres through `POSTGRES_URL` for template persistence.
- Redis through `REDIS_URL` for resumable stream support.
- Vercel Blob through `BLOB_READ_WRITE_TOKEN` for files.
- Gemini API through `GEMINI_API_KEY` for direct chat/title generation and embeddings.
- Qdrant Cloud through `QDRANT_URL`, `QDRANT_API_KEY`, and `QDRANT_COLLECTION` for hybrid retrieval.
- Optional Vercel AI Gateway through `AI_GATEWAY_API_KEY` for Gateway models such as `anthropic/claude-sonnet-5`.

## Environment Contract

Copy `.env.example` to `.env.local` or `.env` and fill the placeholders. Local scripts prefer `.env.local` when present and otherwise load `.env`.

`GEMINI_CHAT_MODEL` defaults to `gemini-3.5-flash` and the app uses it through `@ai-sdk/google`'s Gemini Interactions provider. `AI_GATEWAY_API_KEY` is optional; when present, `/api/models` advertises Gateway models and `GATEWAY_CHAT_MODEL` defaults new chats to `anthropic/claude-sonnet-5`. Direct Gemini remains available as the fallback/non-Gateway path.

`GEMINI_EMBEDDING_MODEL` defaults to `gemini-embedding-2-preview` because Phase 1 found high visual density and approved evaluating multimodal embeddings first. Use `gemini-embedding-001` only if text-only extraction is sufficient and the index will be rebuilt in that vector space.

Run these checks before starting runtime code that calls cloud services:

```bash
pnpm env:check:example
pnpm env:check
```

`pnpm env:check:example` validates that the committed example has the right keys and model identifiers while accepting placeholder secrets. `pnpm env:check` validates `.env.local` or `.env` strictly.

## Production Data Setup

```bash
pnpm db:migrate
pnpm corpus:extract
pnpm corpus:ingest
pnpm prod:check -- --min-points 2000
```

`pnpm corpus:ingest` loads `.env.local`, creates the Qdrant hybrid collection if it does not exist, creates payload indexes, embeds the approved corpus with Gemini, and upserts deterministic chunk points. `pnpm prod:check` verifies Postgres connectivity, Qdrant collection presence/count, and German retrieval smoke queries.

## Development Commands

```bash
pnpm install
pnpm dev
```

Use `pnpm test:unit` for focused unit tests. Use `pnpm test:e2e` for Playwright once `.env.local` contains real service credentials.

## Imported Template

Template source: `https://github.com/vercel/ai-chatbot`

Pinned commit: `2becdb4a56e7683ae08aef927cec1c6c52dfad5e`

The import intentionally keeps the template's auth, persistence, chat route, artifacts system, multimodal input, and in-browser code execution so the prior-work tools and `thesis-proposal` artifact build on the baseline app instead of replacing it.
