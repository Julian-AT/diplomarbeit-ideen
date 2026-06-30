# Phase 1: Corpus Discovery and Design Approval - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-30T22:49:13+02:00
**Phase:** 1-Corpus Discovery and Design Approval
**Areas discussed:** Archive discovery and unpack rules, Inventory and report shape, Content characterization bar, Approval checkpoint contract

---

## Archive Discovery and Unpack Rules

| Question | Options Presented | User's Choice |
|----------|-------------------|---------------|
| Where should Phase 1 look for the thesis archive? | Project-root plus conventional input dirs; Project-root only; Broad recursive repo scan; You decide | Project-root plus conventional input dirs |
| What should happen if Phase 1 finds multiple plausible archives? | Stop and ask for selection; Choose the newest automatically; Unpack all candidates into separate folders; You decide | Stop and ask for selection |
| Where should unpacked corpus files and generated discovery outputs live? | Keep raw and generated artifacts separate; Keep everything under `.planning/corpus/`; Keep corpus files outside `.planning/`, reports inside `.planning/`; You decide | Keep raw and generated artifacts separate |
| What should happen if no archive is found? | Fail with actionable instructions; Create an empty report; Continue with a placeholder design; You decide | Fail with actionable instructions |

**Notes:** Discovery should be bounded but flexible, with user choice required when archive selection is ambiguous.

---

## Inventory and Report Shape

| Question | Options Presented | User's Choice |
|----------|-------------------|---------------|
| How much detail should the inventory include? | Summary plus evidence tables; Executive summary only; Full exhaustive listing in the report; You decide | Summary plus evidence tables |
| Should Phase 1 also produce machine-readable discovery artifacts alongside the human Corpus Report? | Yes: manifests and sample records; Only the human report; Machine-readable only for final proposed schema; You decide | Yes: manifests and sample records |
| How should the report handle sample evidence from the corpus? | Include bounded representative samples; Include no excerpts, paths only; Include broad excerpts for many files; You decide | Include bounded representative samples |
| What should the proposed design section of the Corpus Report include? | Decision-ready proposal with alternatives; Single recommended design only; Open-ended options without recommendation; You decide | Decision-ready proposal with alternatives |

**Notes:** The report should be readable by humans and usable by downstream agents without rediscovering basic corpus facts.

---

## Content Characterization Bar

| Question | Options Presented | User's Choice |
|----------|-------------------|---------------|
| How aggressive should Phase 1 be about language detection? | Detect corpus-level and document-level language signals; Corpus-level language only; Manual inspection only; You decide | Detect corpus-level and document-level language signals |
| How should Phase 1 assess visual density and OCR needs? | Use automated signals plus representative manual checks; Automated text extraction yield only; Manual inspection only; You decide | Use automated signals plus representative manual checks |
| How much should Phase 1 examine document structure consistency? | Classify common structure patterns; Only check whether text extraction works; Deep parse every thesis before design; You decide | Classify common structure patterns |
| What threshold should trigger needs user confirmation before proceeding inside the Corpus Report? | Flag all irreversible or high-cost choices; Only flag embedding model and metadata schema; Ask only if confidence is low; You decide | Flag all irreversible or high-cost choices |

**Notes:** Characterization must be evidence-backed enough to justify parsing, OCR, chunking, metadata, embedding, sparse tokenization, and Qdrant filter choices.

---

## Approval Checkpoint Contract

| Question | Options Presented | User's Choice |
|----------|-------------------|---------------|
| What should be the formal approval object at the end of Phase 1? | A checklist in the Corpus Report plus machine-readable approval manifest; Human-readable checklist only; No formal approval object; You decide | A checklist in the Corpus Report plus machine-readable approval manifest |
| Which decisions must be explicitly approved before full indexing is allowed? | Full indexing contract; Only choices that force re-indexing; Only embedding model and schema; You decide | Full indexing contract |
| How should the system behave if the user requests changes to the proposed design? | Revise report and keep indexing blocked; Proceed with non-controversial parts only; Let planners decide what can proceed; You decide | Revise report and keep indexing blocked |
| Should approval cover confidence levels and known gaps, or only final choices? | Approve choices plus known gaps; Approve final choices only; Track gaps separately outside approval; You decide | Approve choices plus known gaps |

**Notes:** Later indexing must remain blocked until the complete indexing contract is approved.

## Claude's Discretion

None.

## Deferred Ideas

None.
