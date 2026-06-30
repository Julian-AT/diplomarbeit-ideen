# Phase 1: Corpus Discovery and Design Approval - Context

**Gathered:** 2026-06-30T22:49:13+02:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 locates and safely unpacks the provided thesis archive, inventories and characterizes the real corpus, then produces a Corpus Report with a proposed ingestion, metadata, chunking, retrieval, embedding, parsing/OCR, and approval design. It does not perform full indexing, lock irreversible corpus-derived choices without approval, or implement the application foundation.

</domain>

<decisions>
## Implementation Decisions

### Archive Discovery and Unpack Rules
- **D-01:** Discovery must check the repository root plus shallow conventional input directories such as `data/raw/`, `archive/`, `archives/`, `corpus/`, `theses/`, and `input/`.
- **D-02:** If multiple plausible archives are found, stop and ask the user to select one. Show candidate path, size, modified date, and detected archive type before unpacking.
- **D-03:** Keep raw corpus material and generated discovery artifacts separate. Use `.planning/corpus/raw/` for unpacked input and `.planning/corpus/` for reports/manifests unless planning finds a stronger local convention.
- **D-04:** If no archive is found, fail with actionable instructions that list searched locations, accepted archive extensions, and how to rerun with an explicit archive path.

### Inventory and Report Shape
- **D-05:** The Corpus Report must include a human-readable summary backed by evidence tables for file types, counts, sizes, folders, naming patterns, language signals, metadata sources, and representative examples.
- **D-06:** Phase 1 must also produce machine-readable discovery artifacts, including manifests and sample records for file inventory, extracted metadata samples, content characterization samples, and proposed schema fields.
- **D-07:** The report should include bounded representative sample evidence, such as titles, paths, excerpts, or metadata examples per major pattern, with limits to avoid dumping large thesis content into planning docs.
- **D-08:** The proposed design section must be decision-ready: recommend ingestion, metadata, chunking, retrieval, embedding, and parsing/OCR strategy, and include rejected alternatives with rationale.

### Content Characterization Bar
- **D-09:** Language detection must include corpus-level and document-level signals, including dominant languages, likely mixed-language files, and confidence/sample basis.
- **D-10:** Visual density and OCR needs must be assessed through automated signals plus representative manual checks: text extraction yield, page/image/slide indicators, suspicious low-text PDFs, and bounded manual inspection.
- **D-11:** Phase 1 must classify common document structure patterns, including recurring sections, title/author/year availability, future-work sections, abstracts, bibliographies, and extraction reliability for chunking and metadata.
- **D-12:** The report must flag all irreversible or high-cost choices for explicit confirmation, including embedding model, OCR/multimodal path, metadata schema, chunking strategy, parser stack, sparse tokenization, and Qdrant filter fields.

### Approval Checkpoint Contract
- **D-13:** Phase 1 must produce both a human-readable approval checklist in the Corpus Report and a machine-readable approval manifest for downstream agents.
- **D-14:** Full indexing is blocked until the complete indexing contract is explicitly approved: embedding model/dimensions, parser/OCR strategy, metadata schema, chunking rules, sparse strategy/tokenization, Qdrant collection/payload index design, and citation provenance fields.
- **D-15:** If the user requests changes, revise the report and approval manifest, capture the requested changes, and keep ingestion/indexing blocked until approval is explicit.
- **D-16:** Approval must cover final choices plus confidence levels, assumptions, unresolved gaps, and mitigations for each approved choice.

### Claude's Discretion
No decisions were delegated to Claude. The selected choices above are locked for planning.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope and Requirements
- `PRD.md` - Seed brief defining corpus-first discovery, open decisions, and approval-before-indexing requirement.
- `.planning/PROJECT.md` - Project constraints, key decisions, and core value.
- `.planning/REQUIREMENTS.md` - Phase 1 requirements `CORP-01` through `CORP-05`.
- `.planning/ROADMAP.md` - Phase 1 goal, success criteria, and planned slices.

### Repository Guidance
- `AGENTS.md` - Project stack, constraints, Context7 documentation lookup rule, and GSD workflow guidance.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No application code exists yet. The repository currently contains planning documents and the seed PRD only.

### Established Patterns
- Planning is organized under `.planning/`.
- No codebase maps exist yet under `.planning/codebase/`.
- No project-local corpus archive was visible in the repository root during discussion scouting.

### Integration Points
- Phase 1 should create corpus discovery outputs under `.planning/corpus/`.
- Later phases should consume the approval manifest rather than infer approved choices from prose.

</code_context>

<specifics>
## Specific Ideas

- Search locations should be flexible but bounded: repository root plus shallow conventional input directories.
- Candidate archive selection must be user-driven when ambiguous.
- Discovery outputs should be both human-reviewable and machine-readable.
- Corpus sample evidence should be bounded and representative, not exhaustive.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Corpus Discovery and Design Approval*
*Context gathered: 2026-06-30T22:49:13+02:00*
