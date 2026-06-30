# Phase 4 UAT

## Acceptance Criteria

- [x] Spark-to-ideas is represented in the prompt and E2E source coverage.
- [x] Build-on-top is represented through thesis lookup/extension tools and E2E source coverage.
- [x] Chat route exposes server-side prior-work search, thesis lookup, and extension discovery tools.
- [x] Prompt requires citation labels, source paths, and uncertainty surfacing when evidence is weak.
- [x] `thesis-proposal` artifact can stream Markdown, save as a document kind, and use existing edit/version flows.
- [x] Proposal artifact creation and revision are covered by gated E2E source tests.
- [x] Idea-quality scoring can be run with `pnpm quality:proposal --file <proposal.md>`.
- [x] Focused unit tests cover proposal scoring and local retrieval fallback.

## Caveat

Cloud-backed runtime UAT is pending complete credentials for auth/persistence/model/retrieval services. The local ignored env copy still appears incomplete and secret-like, so it was not committed or printed.

## Status

Accepted for Phase 4 source-level completion.