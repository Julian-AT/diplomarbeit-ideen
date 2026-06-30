# Summary 03-01: Extraction and chunking implemented

Added local extraction and typed chunking for the approved corpus design. The extractor writes ignored JSONL records, while TypeScript chunking produces deterministic chunk IDs, page provenance, citation labels, and approved metadata fields.

Dry-run result: 62 extracted text documents from the corpus, 24 non-text files skipped, 0 extraction errors.
