import { createHash } from "node:crypto";

export function stableUuid(input: string): string {
  const bytes = Buffer.from(
    createHash("sha256").update(input).digest("hex").slice(0, 32),
    "hex"
  );

  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

export function stableThesisId(projectSlug: string): string {
  return `thesis-${projectSlug.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
}
