# Corpus Report: Thesis Idea Engine

**Generated:** 2026-06-30T21:08:44+00:00
**Archive:** `C:\Development\Private\diplomarbeit-ideen\_SYPCopilot-Share (1).zip`
**Extraction root:** `C:\Development\Private\diplomarbeit-ideen\.planning\corpus\raw`
**Approval status:** Pending user approval before indexing

## Executive Summary

The corpus archive was located in the project root and safely unpacked into `.planning/corpus/raw/`.
The archive contains 86 files across 10 detected project folders.
The strongest corpus pattern is one folder per diploma project under `syp-projekte`, with each folder containing a primary thesis/report PDF plus supporting artifacts such as proposals, posters, presentations, logos, and videos.

This phase does **not** approve indexing. The downstream ingestion and Qdrant schema remain blocked until the approval manifest is accepted or revised.

## Archive Evidence

- Archive type: `zip`
- Archive size: 5152451123 bytes
- ZIP entries: 86
- Unsafe entries: 0
- Uncompressed bytes: 5152431293
- Compression ratio: 1.0

## Inventory

### File Extensions

| Extension | Count |
| --- | --- |
| .pdf | 50 |
| .mp4 | 12 |
| .pptx | 9 |
| .png | 8 |
| .mov | 4 |
| .docx | 3 |

### Document Types

| Type | Count |
| --- | --- |
| presentation | 18 |
| video | 16 |
| proposal | 9 |
| image | 8 |
| pdf-other | 8 |
| poster | 7 |
| thesis | 6 |
| planning | 6 |
| report | 4 |
| word-document | 2 |
| idea | 1 |
| logo | 1 |

### Project Folders

| Project | Files | Dominant types |
| --- | --- | --- |
| _SYPCopilot-Share | 1 | word-document:1 |
| airchif | 12 | presentation:3, video:2, proposal:1, report:1, thesis:1 |
| blindin | 9 | image:2, video:2, pdf-other:1, thesis:1, presentation:1 |
| dailybuddy | 10 | presentation:2, video:2, proposal:1, planning:1, idea:1 |
| gebaerdentrainer | 13 | presentation:3, proposal:2, video:2, report:1, thesis:1 |
| nook | 11 | presentation:3, pdf-other:2, video:2, proposal:1, image:1 |
| openmask | 11 | presentation:3, pdf-other:2, video:2, proposal:1, image:1 |
| resona | 9 | presentation:2, video:2, proposal:1, planning:1, thesis:1 |
| roomsense | 9 | video:2, pdf-other:1, thesis:1, presentation:1, image:1 |
| syp-unterlagen | 1 | pdf-other:1 |

## Content Characterization

### PDF Text and Visual Signals

| PDF | Pages | Text yield | Chars/page sample | Images/page sample | OCR candidate | Language |
| --- | --- | --- | --- | --- | --- | --- |
| _SYPCopilot-Share/syp-projekte/airchif/airchif-aba-antrag.pdf | 2 | high | 2679 | 0.0 | False | de |
| _SYPCopilot-Share/syp-projekte/airchif/airchif-diplomarbeit.pdf | 90 | high | 1924 | 0.4 | False | de |
| _SYPCopilot-Share/syp-projekte/airchif/airchif-poster.pdf | 1 | medium | 859 | 5.0 | False | de |
| _SYPCopilot-Share/syp-projekte/airchif/airchif-vorstudie.pdf | 21 | high | 1269 | 0.2 | False | de |
| _SYPCopilot-Share/syp-projekte/blindin/blindIn-abnahmeprotokoll.pdf | 10 | medium | 1131 | 0.8 | False | de |
| _SYPCopilot-Share/syp-projekte/blindin/blindin-diplomarbeit.pdf | 105 | medium | 595 | 0.6 | False | de |
| _SYPCopilot-Share/syp-projekte/blindin/blindin-ideenpräsentation.pdf | 12 | low | 13 | 1.0 | True | de |
| _SYPCopilot-Share/syp-projekte/blindin/blindin-projekt-antrag.pdf | 7 | high | 1348 | 0.0 | False | de |
| _SYPCopilot-Share/syp-projekte/blindin/blindin-projektbericht.pdf | 1 | high | 1680 | 4.0 | False | de |
| _SYPCopilot-Share/syp-projekte/dailybuddy/dailybuddy-abschlusspräsentation.pdf | 20 | low | 251 | 1.2 | False | de |
| _SYPCopilot-Share/syp-projekte/dailybuddy/dailybuddy-antrag.pdf | 2 | high | 2760 | 0.0 | False | de |
| _SYPCopilot-Share/syp-projekte/dailybuddy/dailybuddy-charter.pdf | 6 | medium | 879 | 1.2 | False | en |
| _SYPCopilot-Share/syp-projekte/dailybuddy/dailybuddy-idee.pdf | 11 | low | 89 | 0.0 | True | unknown |
| _SYPCopilot-Share/syp-projekte/dailybuddy/dailybuddy-poster.pdf | 1 | medium | 1087 | 6.0 | False | de |
| _SYPCopilot-Share/syp-projekte/dailybuddy/dailybuddy-zwischenstandspräsentation.pdf | 8 | low | 122 | 0.8 | True | en |
| _SYPCopilot-Share/syp-projekte/dailybuddy/dailybuddy_dimplomarbeit.pdf | 115 | high | 2135 | 0.2 | False | mixed-de-en |
| _SYPCopilot-Share/syp-projekte/gebaerdentrainer/gebaerdentrainer-abschlusspraesentation.pdf | 16 | low | 196 | 3.2 | True | de |
| _SYPCopilot-Share/syp-projekte/gebaerdentrainer/gebaerdentrainer-antrag-unikate.pdf | 3 | high | 1590 | 1.0 | False | de |
| _SYPCopilot-Share/syp-projekte/gebaerdentrainer/gebaerdentrainer-antrag.pdf | 5 | high | 1507 | 0.0 | False | de |
| _SYPCopilot-Share/syp-projekte/gebaerdentrainer/gebaerdentrainer-bericht-ji.pdf | 14 | high | 2280 | 0.4 | False | de |

Low-text or OCR-candidate PDFs: 12

### Office and Presentation Signals

Office/presentation text extraction samples: 12

### Video Signals

Video files detected: 16. Videos should be retained as metadata/provenance in v1 unless the user approves transcription or multimodal indexing.

## Language Signals

Detected language evidence from sampled text:

| Language guess | Sample count |
| --- | --- |
| de | 41 |
| en | 11 |
| unknown | 7 |
| mixed-de-en | 3 |

The filename and sampled-text evidence is primarily German or mixed German/English, with technical terms and product names in English. Sparse retrieval should remain first-class for exact names, abbreviations, and German compounds.

## Proposed Ingestion Design

### Parser Strategy

| Artifact | Recommendation |
| --- | --- |
| pdf | Use PyMuPDF/pypdf text extraction first; queue OCR only for low-text or image-heavy PDFs flagged by discovery. |
| presentations | Extract slide text and speaker notes; retain slide-level provenance. Treat slide images as visual evidence only if multimodal indexing is approved. |
| word_documents | Extract body text and core properties; use as metadata/supporting material rather than primary thesis text when a full thesis PDF exists. |
| video | Store metadata and links in v1. Do not index video content unless transcripts or a user-approved transcription path is added. |

### Metadata Schema

Proposed fields:

`thesis_id`, `project_slug`, `title`, `document_type`, `source_path`, `file_name`, `file_ext`, `year`, `language`, `authors`, `advisor`, `page_start`, `page_end`, `chunk_id`, `chunk_index`, `extraction_method`, `text_yield`, `ocr_required`, `citation_label`

### Chunking

Chunk primary thesis/report PDFs by structural headings when available, otherwise by page windows with overlap; keep posters, proposals, and presentations as short supporting chunks with explicit document_type.

### Retrieval

Use Qdrant hybrid dense+sparse retrieval with RRF. Add payload indexes for project_slug, document_type, language, year, and ocr_required after approval.

### Embedding Recommendation

Evaluate Gemini Embedding 2 Preview for multimodal/visual coverage; use gemini-embedding-001 only if OCR/text extraction is approved as sufficient.

## Approval Checklist

Indexing remains blocked until the user explicitly approves or changes:

- [ ] embedding model and vector dimensions
- [ ] OCR/multimodal strategy
- [ ] metadata schema fields
- [ ] chunking rules
- [ ] sparse tokenization strategy
- [ ] Qdrant payload indexes
- [ ] citation provenance fields

## Rejected Alternatives

- Dense-only retrieval: rejected because project names, file names, German compounds, and acronyms need exact sparse matching.
- Final schema before corpus discovery: rejected because the corpus structure is now visible and should drive schema.
- Full video transcription by default: deferred because the archive includes large videos and no transcripts were discovered.

## Machine-Readable Artifacts

- `.planning/corpus/archive-inspection.json`
- `.planning/corpus/manifest.json`
- `.planning/corpus/inventory-summary.json`
- `.planning/corpus/content-samples.json`
- `.planning/corpus/proposed-schema.json`
- `.planning/corpus/APPROVAL-MANIFEST.json`
