"use client";

import { ExternalLinkIcon, FileTextIcon, QuoteIcon } from "lucide-react";

type PriorWorkResultItem = {
  id?: string;
  score?: number;
  excerpt?: string | null;
  citation?: string;
  thesisId?: string;
  projectSlug?: string;
  title?: string;
  documentType?: string;
  sourcePath?: string;
  sourceUrl?: string;
  pageStart?: number | null;
  pageEnd?: number | null;
};

type PriorWorkToolOutput = {
  source?: string;
  query?: string;
  thesisId?: string;
  projectSlug?: string;
  results?: PriorWorkResultItem[];
  evidence?: string;
  error?: string;
};

function pageLabel(result: PriorWorkResultItem) {
  if (
    result.pageStart &&
    result.pageEnd &&
    result.pageStart !== result.pageEnd
  ) {
    return `S. ${result.pageStart}-${result.pageEnd}`;
  }

  if (result.pageStart) {
    return `S. ${result.pageStart}`;
  }

  return null;
}

function compactPath(path: string) {
  if (path.length <= 72) {
    return path;
  }

  return `...${path.slice(-69)}`;
}

export function PriorWorkToolResult({
  output,
}: {
  output: PriorWorkToolOutput;
}) {
  if (output.error) {
    return <div className="text-destructive text-sm">{output.error}</div>;
  }

  const results = output.results ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
        <span className="rounded-full border border-border/60 px-2 py-0.5">
          {output.source === "qdrant" ? "Qdrant" : "Lokaler Index"}
        </span>
        <span>{results.length} Archivbelege</span>
        {output.query && (
          <span className="break-all">Suche: {output.query}</span>
        )}
      </div>

      <div className="grid gap-2">
        {results.slice(0, 6).map((result, index) => {
          const href = result.sourceUrl ?? "#";
          const page = pageLabel(result);

          return (
            <article
              className="rounded-lg border border-border/60 bg-muted/20 p-3"
              key={result.id ?? `${result.sourcePath}-${index}`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 font-medium text-foreground ring-1 ring-border/60">
                  <QuoteIcon className="size-3" />
                  {result.citation ?? `Beleg ${index + 1}`}
                </span>
                {page && (
                  <span className="rounded-full bg-background px-2 py-0.5 text-muted-foreground ring-1 ring-border/60">
                    {page}
                  </span>
                )}
                {result.documentType && (
                  <span className="rounded-full bg-background px-2 py-0.5 text-muted-foreground ring-1 ring-border/60">
                    {result.documentType}
                  </span>
                )}
              </div>

              <div className="mb-2 font-medium text-[13px] text-foreground">
                {result.title ?? result.projectSlug ?? "Archivdokument"}
              </div>

              {result.excerpt && (
                <p className="line-clamp-4 text-[12px] text-muted-foreground leading-relaxed">
                  {result.excerpt}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                {result.sourcePath && (
                  <span className="inline-flex min-w-0 items-center gap-1 rounded bg-background px-2 py-1 ring-1 ring-border/60">
                    <FileTextIcon className="size-3 shrink-0" />
                    <span className="truncate">
                      {compactPath(result.sourcePath)}
                    </span>
                  </span>
                )}
                <a
                  className="inline-flex items-center gap-1 rounded bg-foreground px-2 py-1 font-medium text-background transition-colors hover:bg-foreground/90"
                  href={href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Quelle öffnen
                  <ExternalLinkIcon className="size-3" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
