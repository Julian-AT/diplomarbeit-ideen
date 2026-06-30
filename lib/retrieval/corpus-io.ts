import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CorpusChunk, ExtractedCorpusDocument } from "./types";

export async function readJsonLines<T>(filePath: string): Promise<T[]> {
  const raw = await readFile(filePath, "utf8");

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

export async function writeJsonLines<T>(
  filePath: string,
  rows: T[]
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8"
  );
}

export async function loadExtractedDocuments(
  filePath: string
): Promise<ExtractedCorpusDocument[]> {
  return await readJsonLines<ExtractedCorpusDocument>(filePath);
}

export async function writeChunks(
  filePath: string,
  chunks: CorpusChunk[]
): Promise<void> {
  await writeJsonLines(filePath, chunks);
}
