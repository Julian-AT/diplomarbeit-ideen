#!/usr/bin/env python3
"""Corpus discovery workflow for Thesis Idea Engine.

This script intentionally uses the Python standard library for archive
handling and optional local inspection libraries when available. It does not
index the corpus or commit schema decisions; it produces evidence for approval.
"""

from __future__ import annotations

import argparse
import collections
import datetime as dt
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import zipfile
from html import unescape
from typing import Any


ARCHIVE_EXTENSIONS = (
    ".zip",
    ".tar",
    ".tar.gz",
    ".tgz",
    ".7z",
    ".rar",
    ".gz",
    ".bz2",
    ".xz",
)

SEARCH_DIRS = (
    ".",
    "data",
    "data/raw",
    "archive",
    "archives",
    "corpus",
    "theses",
    "input",
)

GERMAN_HINTS = {
    "der",
    "die",
    "das",
    "und",
    "projekt",
    "diplomarbeit",
    "schueler",
    "schüler",
    "beschreibung",
    "kapitel",
    "aufgabe",
    "entwicklung",
    "benutzer",
    "anwendung",
    "system",
}

ENGLISH_HINTS = {
    "the",
    "and",
    "project",
    "application",
    "user",
    "system",
    "implementation",
    "chapter",
    "development",
    "abstract",
    "requirements",
}


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def json_write(path: pathlib.Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def text_write(path: pathlib.Path, data: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(data, encoding="utf-8", newline="\n")


def find_archives(root: pathlib.Path) -> list[pathlib.Path]:
    candidates: list[pathlib.Path] = []
    seen: set[pathlib.Path] = set()
    for rel in SEARCH_DIRS:
        directory = (root / rel).resolve()
        if not directory.exists() or not directory.is_dir():
            continue
        for child in directory.iterdir():
            if not child.is_file():
                continue
            name = child.name.lower()
            if any(name.endswith(ext) for ext in ARCHIVE_EXTENSIONS):
                resolved = child.resolve()
                if resolved not in seen:
                    seen.add(resolved)
                    candidates.append(resolved)
    return sorted(candidates)


def safe_join(base: pathlib.Path, member_name: str) -> pathlib.Path:
    pure = pathlib.PurePosixPath(member_name)
    if member_name.startswith("/") or "\\" in member_name or ":" in member_name or ".." in pure.parts:
        raise ValueError(f"Unsafe archive path: {member_name}")
    target = (base / pathlib.Path(*pure.parts)).resolve()
    base_resolved = base.resolve()
    if os.path.commonpath([str(base_resolved), str(target)]) != str(base_resolved):
        raise ValueError(f"Archive path escapes destination: {member_name}")
    return target


def inspect_zip(archive: pathlib.Path) -> dict[str, Any]:
    with zipfile.ZipFile(archive) as zf:
        entries = zf.infolist()
        unsafe: list[str] = []
        for entry in entries:
            try:
                safe_join(pathlib.Path("x").resolve(), entry.filename)
            except ValueError:
                unsafe.append(entry.filename)
        suffix_counts = collections.Counter(
            pathlib.PurePosixPath(entry.filename).suffix.lower() or "<none>"
            for entry in entries
            if not entry.is_dir()
        )
        top_level = collections.Counter(
            pathlib.PurePosixPath(entry.filename).parts[0] if pathlib.PurePosixPath(entry.filename).parts else "<root>"
            for entry in entries
        )
        return {
            "archive": str(archive),
            "archive_type": "zip",
            "size_bytes": archive.stat().st_size,
            "entry_count": len(entries),
            "file_count": sum(1 for entry in entries if not entry.is_dir()),
            "directory_count": sum(1 for entry in entries if entry.is_dir()),
            "total_uncompressed_bytes": sum(entry.file_size for entry in entries),
            "total_compressed_bytes": sum(entry.compress_size for entry in entries),
            "compression_ratio": round(
                (sum(entry.compress_size for entry in entries) / max(1, sum(entry.file_size for entry in entries))),
                4,
            ),
            "top_extensions": suffix_counts.most_common(),
            "top_level": top_level.most_common(),
            "unsafe_entries": unsafe,
            "sample_entries": [entry.filename for entry in entries[:50]],
        }


def extract_zip(archive: pathlib.Path, destination: pathlib.Path, force: bool = False) -> dict[str, Any]:
    destination.mkdir(parents=True, exist_ok=True)
    marker = destination / ".extract-complete.json"
    if marker.exists() and not force:
        return json.loads(marker.read_text(encoding="utf-8"))

    with zipfile.ZipFile(archive) as zf:
        entries = zf.infolist()
        for entry in entries:
            target = safe_join(destination, entry.filename)
            if entry.is_dir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(entry) as src, target.open("wb") as dst:
                shutil.copyfileobj(src, dst, length=1024 * 1024)

    result = {
        "archive": str(archive),
        "destination": str(destination),
        "extracted_at": now_iso(),
        "file_count": sum(1 for path in destination.rglob("*") if path.is_file() and path.name != ".extract-complete.json"),
    }
    json_write(marker, result)
    return result


def classify_file(path: pathlib.Path) -> str:
    name = path.name.lower()
    suffix = path.suffix.lower()
    if suffix in {".mp4", ".mov", ".m4v", ".avi", ".webm"}:
        return "video"
    if suffix in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}:
        return "image"
    if suffix in {".pptx", ".ppt"} or "präsentation" in name or "praesentation" in name:
        return "presentation"
    if "diplomarbeit" in name or "dimplomarbeit" in name:
        return "thesis"
    if "poster" in name:
        return "poster"
    if "logo" in name:
        return "logo"
    if "antrag" in name or "proposal" in name:
        return "proposal"
    if "bericht" in name or "report" in name:
        return "report"
    if "vorstudie" in name or "charter" in name:
        return "planning"
    if "idee" in name or "idea" in name:
        return "idea"
    if suffix == ".pdf":
        return "pdf-other"
    if suffix in {".docx", ".doc"}:
        return "word-document"
    return "other"


def project_slug_for(path: pathlib.Path, raw_root: pathlib.Path) -> str | None:
    rel = path.relative_to(raw_root)
    parts = rel.parts
    lowered = [part.lower() for part in parts]
    if "syp-projekte" in lowered:
        idx = lowered.index("syp-projekte")
        if len(parts) > idx + 1:
            return parts[idx + 1]
    if len(parts) >= 2:
        return parts[-2]
    return None


def build_inventory(raw_root: pathlib.Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(raw_root.rglob("*")):
        if not path.is_file() or path.name == ".extract-complete.json":
            continue
        rel = path.relative_to(raw_root).as_posix()
        stat = path.stat()
        records.append(
            {
                "relative_path": rel,
                "name": path.name,
                "suffix": path.suffix.lower() or "<none>",
                "size_bytes": stat.st_size,
                "modified_utc": dt.datetime.fromtimestamp(stat.st_mtime, dt.timezone.utc)
                .replace(microsecond=0)
                .isoformat(),
                "project_slug": project_slug_for(path, raw_root),
                "document_type": classify_file(path),
            }
        )
    return records


def load_optional_fitz():
    try:
        import fitz  # type: ignore

        return fitz
    except Exception:
        return None


def language_guess(text: str) -> dict[str, Any]:
    tokens = re.findall(r"[A-Za-zÄÖÜäöüß]+", text.lower())
    if not tokens:
        return {"language": "unknown", "confidence": "none", "german_hits": 0, "english_hits": 0}
    counts = collections.Counter(tokens)
    german_hits = sum(counts[token] for token in GERMAN_HINTS)
    english_hits = sum(counts[token] for token in ENGLISH_HINTS)
    total = max(1, german_hits + english_hits)
    if german_hits == 0 and english_hits == 0:
        return {"language": "unknown", "confidence": "low", "german_hits": 0, "english_hits": 0}
    if german_hits >= english_hits * 1.5:
        lang = "de"
    elif english_hits >= german_hits * 1.5:
        lang = "en"
    else:
        lang = "mixed-de-en"
    confidence = "high" if max(german_hits, english_hits) / total >= 0.75 and total >= 20 else "medium"
    return {
        "language": lang,
        "confidence": confidence,
        "german_hits": german_hits,
        "english_hits": english_hits,
    }


def inspect_pdf(path: pathlib.Path, raw_root: pathlib.Path, max_pages: int) -> dict[str, Any]:
    fitz = load_optional_fitz()
    result: dict[str, Any] = {
        "relative_path": path.relative_to(raw_root).as_posix(),
        "project_slug": project_slug_for(path, raw_root),
        "parser": "pymupdf" if fitz else "unavailable",
        "page_count": None,
        "sampled_pages": 0,
        "sample_text_chars": 0,
        "chars_per_sampled_page": 0,
        "image_count_sample": 0,
        "images_per_sampled_page": 0,
        "text_yield": "unknown",
        "ocr_candidate": None,
        "language_guess": {"language": "unknown", "confidence": "none"},
        "excerpt": "",
        "error": None,
    }
    if not fitz:
        result["error"] = "PyMuPDF not installed"
        return result
    try:
        doc = fitz.open(path)
        page_count = len(doc)
        sampled = min(page_count, max_pages)
        chunks: list[str] = []
        image_count = 0
        for index in range(sampled):
            page = doc[index]
            chunks.append(page.get_text("text") or "")
            image_count += len(page.get_images(full=True))
        text = "\n".join(chunks)
        chars_per_page = int(len(text) / sampled) if sampled else 0
        if chars_per_page >= 1200:
            text_yield = "high"
        elif chars_per_page >= 350:
            text_yield = "medium"
        elif chars_per_page > 0:
            text_yield = "low"
        else:
            text_yield = "none"
        result.update(
            {
                "page_count": page_count,
                "sampled_pages": sampled,
                "sample_text_chars": len(text),
                "chars_per_sampled_page": chars_per_page,
                "image_count_sample": image_count,
                "images_per_sampled_page": round(image_count / sampled, 2) if sampled else 0,
                "text_yield": text_yield,
                "ocr_candidate": chars_per_page < 250 and page_count > 0,
                "language_guess": language_guess(text),
                "excerpt": re.sub(r"\s+", " ", text).strip()[:700],
            }
        )
        doc.close()
    except Exception as exc:  # noqa: BLE001
        result["error"] = f"{type(exc).__name__}: {exc}"
    return result


def extract_office_text(path: pathlib.Path, raw_root: pathlib.Path, max_chars: int = 1200) -> dict[str, Any]:
    rel = path.relative_to(raw_root).as_posix()
    result = {
        "relative_path": rel,
        "project_slug": project_slug_for(path, raw_root),
        "suffix": path.suffix.lower(),
        "text_chars": 0,
        "language_guess": {"language": "unknown", "confidence": "none"},
        "excerpt": "",
        "error": None,
    }
    try:
        pieces: list[str] = []
        with zipfile.ZipFile(path) as zf:
            names = zf.namelist()
            if path.suffix.lower() == ".docx":
                targets = [name for name in names if name == "word/document.xml"]
            else:
                targets = [name for name in names if name.startswith("ppt/slides/slide") and name.endswith(".xml")]
            for name in sorted(targets)[:20]:
                xml = zf.read(name).decode("utf-8", errors="ignore")
                xml = re.sub(r"<[^>]+>", " ", xml)
                pieces.append(unescape(xml))
        text = re.sub(r"\s+", " ", " ".join(pieces)).strip()
        result.update(
            {
                "text_chars": len(text),
                "language_guess": language_guess(text),
                "excerpt": text[:max_chars],
            }
        )
    except Exception as exc:  # noqa: BLE001
        result["error"] = f"{type(exc).__name__}: {exc}"
    return result


def ffprobe_video(path: pathlib.Path, raw_root: pathlib.Path) -> dict[str, Any]:
    result = {
        "relative_path": path.relative_to(raw_root).as_posix(),
        "project_slug": project_slug_for(path, raw_root),
        "size_bytes": path.stat().st_size,
        "duration_seconds": None,
        "width": None,
        "height": None,
        "error": None,
    }
    try:
        proc = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height:format=duration",
                "-of",
                "json",
                str(path),
            ],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        if proc.returncode != 0:
            result["error"] = proc.stderr.strip()[:300] or f"ffprobe exited {proc.returncode}"
            return result
        payload = json.loads(proc.stdout or "{}")
        streams = payload.get("streams") or []
        fmt = payload.get("format") or {}
        if streams:
            result["width"] = streams[0].get("width")
            result["height"] = streams[0].get("height")
        if fmt.get("duration"):
            result["duration_seconds"] = round(float(fmt["duration"]), 2)
    except Exception as exc:  # noqa: BLE001
        result["error"] = f"{type(exc).__name__}: {exc}"
    return result


def summarize_inventory(records: list[dict[str, Any]]) -> dict[str, Any]:
    by_ext = collections.Counter(record["suffix"] for record in records)
    by_type = collections.Counter(record["document_type"] for record in records)
    by_project = collections.defaultdict(list)
    for record in records:
        by_project[record["project_slug"] or "<unknown>"].append(record)
    projects = []
    for slug, items in sorted(by_project.items()):
        projects.append(
            {
                "project_slug": slug,
                "file_count": len(items),
                "total_size_bytes": sum(item["size_bytes"] for item in items),
                "types": collections.Counter(item["document_type"] for item in items).most_common(),
                "files": [item["relative_path"] for item in sorted(items, key=lambda item: item["relative_path"])],
            }
        )
    return {
        "file_count": len(records),
        "total_size_bytes": sum(record["size_bytes"] for record in records),
        "extensions": by_ext.most_common(),
        "document_types": by_type.most_common(),
        "project_count": len([p for p in projects if p["project_slug"] != "<unknown>"]),
        "projects": projects,
    }


def build_recommendations(
    summary: dict[str, Any],
    pdf_samples: list[dict[str, Any]],
    office_samples: list[dict[str, Any]],
) -> dict[str, Any]:
    pdf_count = sum(count for ext, count in summary["extensions"] if ext == ".pdf")
    video_count = sum(count for typ, count in summary["document_types"] if typ == "video")
    presentation_count = sum(count for typ, count in summary["document_types"] if typ == "presentation")
    low_text = [sample for sample in pdf_samples if sample.get("ocr_candidate")]
    high_or_medium = [
        sample for sample in pdf_samples if sample.get("text_yield") in {"high", "medium"}
    ]
    language_counts = collections.Counter()
    for sample in pdf_samples + office_samples:
        language_counts[sample.get("language_guess", {}).get("language", "unknown")] += 1
    visual_signal = "high" if video_count + presentation_count >= pdf_count / 2 else "medium"
    text_signal = "good" if len(high_or_medium) >= max(1, pdf_count // 2) else "mixed"
    if visual_signal == "high" or len(low_text) >= max(3, pdf_count // 4):
        embedding = "Evaluate Gemini Embedding 2 Preview for multimodal/visual coverage; use gemini-embedding-001 only if OCR/text extraction is approved as sufficient."
    else:
        embedding = "Prefer gemini-embedding-001 for the text index, with sparse vectors retained for exact terms."
    return {
        "parser_strategy": {
            "pdf": "Use PyMuPDF/pypdf text extraction first; queue OCR only for low-text or image-heavy PDFs flagged by discovery.",
            "presentations": "Extract slide text and speaker notes; retain slide-level provenance. Treat slide images as visual evidence only if multimodal indexing is approved.",
            "word_documents": "Extract body text and core properties; use as metadata/supporting material rather than primary thesis text when a full thesis PDF exists.",
            "video": "Store metadata and links in v1. Do not index video content unless transcripts or a user-approved transcription path is added.",
        },
        "metadata_schema": [
            "thesis_id",
            "project_slug",
            "title",
            "document_type",
            "source_path",
            "file_name",
            "file_ext",
            "year",
            "language",
            "authors",
            "advisor",
            "page_start",
            "page_end",
            "chunk_id",
            "chunk_index",
            "extraction_method",
            "text_yield",
            "ocr_required",
            "citation_label",
        ],
        "chunking": "Chunk primary thesis/report PDFs by structural headings when available, otherwise by page windows with overlap; keep posters, proposals, and presentations as short supporting chunks with explicit document_type.",
        "retrieval": "Use Qdrant hybrid dense+sparse retrieval with RRF. Add payload indexes for project_slug, document_type, language, year, and ocr_required after approval.",
        "embedding_recommendation": embedding,
        "language_summary": language_counts.most_common(),
        "confidence": {
            "text_extraction": text_signal,
            "visual_density": visual_signal,
            "metadata_completeness": "medium",
        },
        "blocked_until_approval": [
            "embedding model and vector dimensions",
            "OCR/multimodal strategy",
            "metadata schema fields",
            "chunking rules",
            "sparse tokenization strategy",
            "Qdrant payload indexes",
            "citation provenance fields",
        ],
    }


def markdown_table(rows: list[list[Any]], headers: list[str]) -> str:
    out = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        out.append("| " + " | ".join(str(value).replace("\n", " ") for value in row) + " |")
    return "\n".join(out)


def write_report(
    path: pathlib.Path,
    archive_info: dict[str, Any],
    extract_info: dict[str, Any],
    summary: dict[str, Any],
    pdf_samples: list[dict[str, Any]],
    office_samples: list[dict[str, Any]],
    video_samples: list[dict[str, Any]],
    recommendations: dict[str, Any],
) -> None:
    ext_rows = [[ext, count] for ext, count in summary["extensions"]]
    type_rows = [[typ, count] for typ, count in summary["document_types"]]
    project_rows = [
        [
            project["project_slug"],
            project["file_count"],
            ", ".join(f"{kind}:{count}" for kind, count in project["types"][:5]),
        ]
        for project in summary["projects"]
    ]
    pdf_rows = [
        [
            sample["relative_path"],
            sample.get("page_count"),
            sample.get("text_yield"),
            sample.get("chars_per_sampled_page"),
            sample.get("images_per_sampled_page"),
            sample.get("ocr_candidate"),
            sample.get("language_guess", {}).get("language"),
        ]
        for sample in pdf_samples[:20]
    ]
    low_text = [sample for sample in pdf_samples if sample.get("ocr_candidate")]
    report = f"""# Corpus Report: Thesis Idea Engine

**Generated:** {now_iso()}
**Archive:** `{archive_info['archive']}`
**Extraction root:** `{extract_info['destination']}`
**Approval status:** Pending user approval before indexing

## Executive Summary

The corpus archive was located in the project root and safely unpacked into `.planning/corpus/raw/`.
The archive contains {summary['file_count']} files across {summary['project_count']} detected project folders.
The strongest corpus pattern is one folder per diploma project under `syp-projekte`, with each folder containing a primary thesis/report PDF plus supporting artifacts such as proposals, posters, presentations, logos, and videos.

This phase does **not** approve indexing. The downstream ingestion and Qdrant schema remain blocked until the approval manifest is accepted or revised.

## Archive Evidence

- Archive type: `{archive_info['archive_type']}`
- Archive size: {archive_info['size_bytes']} bytes
- ZIP entries: {archive_info['entry_count']}
- Unsafe entries: {len(archive_info['unsafe_entries'])}
- Uncompressed bytes: {archive_info['total_uncompressed_bytes']}
- Compression ratio: {archive_info['compression_ratio']}

## Inventory

### File Extensions

{markdown_table(ext_rows, ['Extension', 'Count'])}

### Document Types

{markdown_table(type_rows, ['Type', 'Count'])}

### Project Folders

{markdown_table(project_rows, ['Project', 'Files', 'Dominant types'])}

## Content Characterization

### PDF Text and Visual Signals

{markdown_table(pdf_rows, ['PDF', 'Pages', 'Text yield', 'Chars/page sample', 'Images/page sample', 'OCR candidate', 'Language'])}

Low-text or OCR-candidate PDFs: {len(low_text)}

### Office and Presentation Signals

Office/presentation text extraction samples: {len(office_samples)}

### Video Signals

Video files detected: {len(video_samples)}. Videos should be retained as metadata/provenance in v1 unless the user approves transcription or multimodal indexing.

## Language Signals

Detected language evidence from sampled text:

{markdown_table([[lang, count] for lang, count in recommendations['language_summary']], ['Language guess', 'Sample count'])}

The filename and sampled-text evidence is primarily German or mixed German/English, with technical terms and product names in English. Sparse retrieval should remain first-class for exact names, abbreviations, and German compounds.

## Proposed Ingestion Design

### Parser Strategy

{markdown_table([[key, value] for key, value in recommendations['parser_strategy'].items()], ['Artifact', 'Recommendation'])}

### Metadata Schema

Proposed fields:

{', '.join(f'`{field}`' for field in recommendations['metadata_schema'])}

### Chunking

{recommendations['chunking']}

### Retrieval

{recommendations['retrieval']}

### Embedding Recommendation

{recommendations['embedding_recommendation']}

## Approval Checklist

Indexing remains blocked until the user explicitly approves or changes:

{chr(10).join(f'- [ ] {item}' for item in recommendations['blocked_until_approval'])}

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
"""
    text_write(path, report)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Discover and characterize the thesis corpus archive.")
    parser.add_argument("--archive", help="Explicit archive path. If omitted, conventional locations are searched.")
    parser.add_argument("--output", default=".planning/corpus", help="Output directory for discovery artifacts.")
    parser.add_argument("--raw-dir", default=".planning/corpus/raw", help="Raw extraction directory.")
    parser.add_argument("--force-extract", action="store_true", help="Extract again even if the completion marker exists.")
    parser.add_argument("--pdf-pages", type=int, default=5, help="Number of leading PDF pages to sample.")
    args = parser.parse_args(argv)

    root = pathlib.Path.cwd()
    output_dir = (root / args.output).resolve()
    raw_dir = (root / args.raw_dir).resolve()

    if args.archive:
        archive = (root / args.archive).resolve()
        if not archive.exists():
            print(f"Archive not found: {archive}", file=sys.stderr)
            return 2
    else:
        candidates = find_archives(root)
        if not candidates:
            payload = {
                "searched_locations": SEARCH_DIRS,
                "accepted_extensions": ARCHIVE_EXTENSIONS,
                "message": "No supported archive found.",
            }
            json_write(output_dir / "archive-discovery-error.json", payload)
            print(json.dumps(payload, indent=2), file=sys.stderr)
            return 2
        if len(candidates) > 1:
            payload = {
                "message": "Multiple archive candidates found. Select one explicitly with --archive.",
                "candidates": [
                    {
                        "path": str(candidate.relative_to(root)),
                        "size_bytes": candidate.stat().st_size,
                        "modified_utc": dt.datetime.fromtimestamp(candidate.stat().st_mtime, dt.timezone.utc)
                        .replace(microsecond=0)
                        .isoformat(),
                    }
                    for candidate in candidates
                ],
            }
            json_write(output_dir / "archive-candidates.json", payload)
            print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
            return 3
        archive = candidates[0]

    if archive.suffix.lower() != ".zip":
        print(f"Unsupported archive type for safe extraction workflow: {archive}", file=sys.stderr)
        return 4

    output_dir.mkdir(parents=True, exist_ok=True)
    archive_info = inspect_zip(archive)
    if archive_info["unsafe_entries"]:
        json_write(output_dir / "archive-inspection.json", archive_info)
        print("Unsafe archive entries found; refusing extraction.", file=sys.stderr)
        return 5

    extract_info = extract_zip(archive, raw_dir, force=args.force_extract)
    records = build_inventory(raw_dir)
    summary = summarize_inventory(records)

    pdf_paths = [raw_dir / record["relative_path"] for record in records if record["suffix"] == ".pdf"]
    pdf_samples = [inspect_pdf(path, raw_dir, max_pages=max(1, args.pdf_pages)) for path in pdf_paths]

    office_paths = [
        raw_dir / record["relative_path"]
        for record in records
        if record["suffix"] in {".docx", ".pptx"}
    ]
    office_samples = [extract_office_text(path, raw_dir) for path in office_paths]

    video_paths = [
        raw_dir / record["relative_path"]
        for record in records
        if record["document_type"] == "video"
    ]
    video_samples = [ffprobe_video(path, raw_dir) for path in video_paths]

    recommendations = build_recommendations(summary, pdf_samples, office_samples)

    json_write(output_dir / "archive-inspection.json", archive_info)
    json_write(output_dir / "manifest.json", {"generated_at": now_iso(), "files": records})
    json_write(output_dir / "inventory-summary.json", {"generated_at": now_iso(), **summary})
    json_write(
        output_dir / "content-samples.json",
        {
            "generated_at": now_iso(),
            "pdf_samples": pdf_samples,
            "office_samples": office_samples,
            "video_samples": video_samples,
        },
    )
    json_write(
        output_dir / "proposed-schema.json",
        {
            "generated_at": now_iso(),
            "status": "proposed",
            "recommendations": recommendations,
        },
    )
    approval = {
        "generated_at": now_iso(),
        "status": "pending_user_approval",
        "phase": 1,
        "blocked_downstream": True,
        "approval_required_for": recommendations["blocked_until_approval"],
        "proposed_choices": recommendations,
        "evidence_files": [
            ".planning/corpus/archive-inspection.json",
            ".planning/corpus/manifest.json",
            ".planning/corpus/inventory-summary.json",
            ".planning/corpus/content-samples.json",
            ".planning/corpus/proposed-schema.json",
            ".planning/corpus/CORPUS-REPORT.md",
        ],
    }
    json_write(output_dir / "APPROVAL-MANIFEST.json", approval)
    write_report(
        output_dir / "CORPUS-REPORT.md",
        archive_info,
        extract_info,
        summary,
        pdf_samples,
        office_samples,
        video_samples,
        recommendations,
    )
    print(
        json.dumps(
            {
                "status": "ok",
                "archive": str(archive.relative_to(root)),
                "output": str(output_dir.relative_to(root)),
                "raw_dir": str(raw_dir.relative_to(root)),
                "file_count": summary["file_count"],
                "project_count": summary["project_count"],
                "approval_status": "pending_user_approval",
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

