# Phase 3 UAT

## Acceptance Criteria

- [x] Corpus extraction can run over the approved raw archive.
- [x] Chunk IDs are deterministic and include citation provenance.
- [x] Sparse vectors are deterministic and stable across reruns.
- [x] Ingestion dry-run produces chunk, sparse stats, and ingestion-plan artifacts without cloud calls.
- [x] Qdrant wrapper defines hybrid dense+sparse collection setup, payload indexes, and idempotent upsert points.
- [x] Retrieval wrapper builds filtered RRF hybrid query requests.
- [x] Focused unit tests cover chunking, sparse encoding, Qdrant wrapper behavior, and fusion query shape.

## Caveat

Real Qdrant storage and Gemini embeddings require complete `.env.local` credentials. The current local env copy has secret-looking partial values but still leaves required Blob/Qdrant/Gemini placeholders, so full cloud UAT cannot be completed safely from this workspace state.

## Status

Accepted for Phase 3 source-level completion.
