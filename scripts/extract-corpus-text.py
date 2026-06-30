from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

try:
    import fitz  # PyMuPDF
except Exception:  # pragma: no cover - checked at runtime
    fitz = None

TEXT_EXTENSIONS = {".pdf", ".docx", ".pptx"}
GERMAN_MARKERS = {
    "und",
    "der",
    "die",
    "das",
    "nicht",
    "mit",
    "projekt",
    "diplomarbeit",
    "schueler",
    "ueber",
    "ueber",
}
ENGLISH_MARKERS = {
    "and",
    "the",
    "with",
    "project",
    "student",
    "thesis",
    "application",
    "system",
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True))
            handle.write("\n")


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def human_title(file_name: str) -> str:
    stem = re.sub(r"\.[^.]+$", "", file_name)
    return re.sub(r"\s+", " ", re.sub(r"[_-]+", " ", stem)).strip().title()


def stable_thesis_id(project_slug: str) -> str:
    slug = re.sub(r"[^a-z0-9_-]+", "-", project_slug.lower()).strip("-")
    return f"thesis-{slug or 'unknown'}"


def infer_year(text: str, file_name: str) -> int | None:
    for candidate in re.findall(r"\b(20\d{2}|19\d{2})\b", f"{file_name} {text[:2000]}"):
        year = int(candidate)
        if 1990 <= year <= datetime.now().year + 1:
            return year
    return None


def infer_language(text: str) -> str | None:
    tokens = re.findall(r"\\w+", text.lower())
    if not tokens:
        return None
    german_hits = sum(1 for token in tokens if token in GERMAN_MARKERS)
    english_hits = sum(1 for token in tokens if token in ENGLISH_MARKERS)
    if german_hits >= 3 and english_hits >= 3:
        return "mixed-de-en"
    if german_hits >= english_hits and german_hits >= 2:
        return "de"
    if english_hits > german_hits and english_hits >= 2:
        return "en"
    return None


def text_yield(total_chars: int, page_count: int) -> str:
    if page_count <= 0 or total_chars == 0:
        return "none"
    chars_per_page = total_chars / page_count
    if chars_per_page >= 1200:
        return "high"
    if chars_per_page >= 400:
        return "medium"
    if chars_per_page >= 80:
        return "low"
    return "none"


def text_from_xml(xml_bytes: bytes) -> str:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return ""
    parts: list[str] = []
    for element in root.iter():
        if element.text and element.tag.endswith("}t"):
            parts.append(element.text)
    return normalize_text(" ".join(parts))


def extract_pdf(path: Path) -> tuple[list[dict[str, Any]], str]:
    if fitz is None:
        raise RuntimeError("PyMuPDF (fitz) is required for PDF extraction.")
    pages: list[dict[str, Any]] = []
    with fitz.open(path) as document:
        for index, page in enumerate(document, start=1):
            pages.append({"page_number": index, "text": normalize_text(page.get_text("text"))})
    return pages, "pymupdf"


def extract_docx(path: Path) -> tuple[list[dict[str, Any]], str]:
    with zipfile.ZipFile(path) as archive:
        try:
            text = text_from_xml(archive.read("word/document.xml"))
        except KeyError:
            text = ""
    return [{"page_number": 1, "text": text}], "docx-xml"


def extract_pptx(path: Path) -> tuple[list[dict[str, Any]], str]:
    slides: list[dict[str, Any]] = []
    with zipfile.ZipFile(path) as archive:
        slide_names = sorted(
            name
            for name in archive.namelist()
            if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)
        )
        for fallback_index, name in enumerate(slide_names, start=1):
            match = re.search(r"slide(\d+)\.xml$", name)
            slide_number = int(match.group(1)) if match else fallback_index
            slides.append({"slide_number": slide_number, "text": text_from_xml(archive.read(name))})
    return slides, "pptx-xml"


def extract_file(path: Path, suffix: str) -> tuple[list[dict[str, Any]], str]:
    if suffix == ".pdf":
        return extract_pdf(path)
    if suffix == ".docx":
        return extract_docx(path)
    if suffix == ".pptx":
        return extract_pptx(path)
    return [], "skipped"


def build_document(entry: dict[str, Any], raw_root: Path) -> dict[str, Any] | None:
    suffix = str(entry.get("suffix", "")).lower()
    if suffix not in TEXT_EXTENSIONS:
        return None

    source_path = str(entry["relative_path"])
    absolute_path = raw_root / source_path
    if not absolute_path.exists():
        raise FileNotFoundError(f"Missing extracted file: {absolute_path}")

    pages, extraction_method = extract_file(absolute_path, suffix)
    combined_text = "\n".join(page.get("text", "") for page in pages)
    total_chars = len(combined_text)
    page_count = max(len(pages), 1)
    detected_language = infer_language(combined_text)
    detected_yield = text_yield(total_chars, page_count)
    file_name = str(entry.get("name") or absolute_path.name)
    project_slug = str(entry.get("project_slug") or "unknown")

    return {
        "advisor": None,
        "authors": [],
        "document_type": entry.get("document_type", "unknown"),
        "extraction_method": extraction_method,
        "file_ext": suffix,
        "file_name": file_name,
        "language": detected_language,
        "ocr_required": detected_yield in {"none", "low"} and suffix == ".pdf",
        "pages": pages,
        "project_slug": project_slug,
        "source_path": source_path,
        "text_yield": detected_yield,
        "thesis_id": stable_thesis_id(project_slug),
        "title": human_title(file_name),
        "year": infer_year(combined_text, file_name),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract corpus text into JSONL for indexing.")
    parser.add_argument("--manifest", default=".planning/corpus/manifest.json")
    parser.add_argument("--raw-root", default=".planning/corpus/raw")
    parser.add_argument("--out", default=".planning/corpus/extracted/documents.jsonl")
    parser.add_argument("--summary", default=".planning/corpus/extracted/summary.json")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    raw_root = Path(args.raw_root)
    out_path = Path(args.out)
    summary_path = Path(args.summary)

    manifest = load_json(manifest_path)
    entries = manifest.get("files", [])
    if args.limit is not None:
        entries = entries[: args.limit]

    documents: list[dict[str, Any]] = []
    skipped = 0
    errors: list[dict[str, str]] = []

    for entry in entries:
        try:
            document = build_document(entry, raw_root)
            if document is None:
                skipped += 1
                continue
            documents.append(document)
        except Exception as error:  # keep extraction going and report failures
            errors.append({"source_path": str(entry.get("relative_path", "unknown")), "error": str(error)})

    write_jsonl(out_path, documents)
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "manifest": str(manifest_path),
        "raw_root": str(raw_root),
        "output": str(out_path),
        "documents": len(documents),
        "skipped_non_text": skipped,
        "errors": errors,
        "document_types": Counter(document["document_type"] for document in documents).most_common(),
        "text_yield": Counter(document["text_yield"] for document in documents).most_common(),
    }
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
