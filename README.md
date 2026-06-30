# Diplomarbeit Ideen

AI/ML thesis idea engine for HTL Donaustadt. The app helps students find realistic Diplomarbeit topics by retrieving prior projects from the archive, grounding every idea in cited evidence, and routing generation through Gemini or Vercel AI Gateway depending on available quota.

## Core Pipeline

```mermaid
flowchart LR
  A[Archive PDFs, docs, slides] --> B[Text extraction]
  B --> C[Chunking plus metadata]
  C --> D[Gemini embeddings]
  C --> E[German sparse terms]
  D --> F[(Qdrant dense vectors)]
  E --> G[(Qdrant sparse vectors)]
  F --> H[Hybrid retrieval]
  G --> H
  H --> I[Evidence grounded idea generation]
```

The retrieval layer is corpus first. Prior theses are normalized into stable project IDs, source paths, chunk text, titles, departments, years, and retrieval links. Qdrant stores dense semantic vectors plus sparse lexical signals so German compounds, acronyms, project names, and exact technology terms stay searchable.

## Runtime Flow

```mermaid
sequenceDiagram
  participant Student
  participant Chat as Next.js Chat API
  participant Tools as Prior Work Tools
  participant Qdrant
  participant LLM as Gemini or Gateway Model

  Student->>Chat: German idea request
  Chat->>Tools: searchPriorWork or findThesisExtensions
  Tools->>Qdrant: hybrid dense plus sparse query
  Qdrant-->>Tools: cited chunks and source links
  Tools-->>LLM: structured evidence
  LLM-->>Student: 3 to 5 feasible ideas with references
```

The assistant is optimized for German Diplomarbeit workflows. Prompts require archive lookup before ideation, concise proposals, direct source labels, feasibility notes, and evaluation criteria.

## Model Routing

```mermaid
flowchart TD
  A[/api/models/] --> B{AI Gateway auth?}
  B -- no --> C[Gemini 3.5 Flash via @ai-sdk/google]
  B -- yes --> D[Fetch Gateway models]
  D --> E{Positive Gateway balance?}
  E -- yes --> F[Default Claude Sonnet 5]
  E -- no --> C
  D --> G[Selector order: Gemini, Sonnet 5, Gateway Gemini, all discovered models]
```

Default generation uses `gemini-3.5-flash` through `@ai-sdk/google`. Gateway support remains enabled when `AI_GATEWAY_API_KEY` or Vercel OIDC is present. The selector fetches the live Gateway catalog, prioritizes Sonnet 5, and keeps every other available language model selectable.

## Stack

- Next.js App Router and Vercel AI SDK for streaming chat, tools, auth, persistence, and artifacts.
- `@ai-sdk/google` for direct Gemini chat, title generation, and embeddings.
- Vercel AI Gateway for optional multi-provider model routing.
- Qdrant Cloud for hybrid dense plus sparse retrieval.
- Neon Postgres, Redis, and Vercel Blob for template persistence.

## Checks

```bash
pnpm env:check
pnpm corpus:ingest:dry-run
pnpm test:unit
pnpm check
pnpm build
```
