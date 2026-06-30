import { auth } from "@/app/(auth)/auth";
import { getSourceContextRecords } from "@/lib/retrieval/service";

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pageLabel(pageStart: number | null, pageEnd: number | null): string {
  if (pageStart && pageEnd && pageStart !== pageEnd) {
    return `S. ${pageStart}-${pageEnd}`;
  }

  if (pageStart) {
    return `S. ${pageStart}`;
  }

  return "Seite unbekannt";
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sourcePath = searchParams.get("sourcePath");

  if (!sourcePath) {
    return new Response("Missing sourcePath", { status: 400 });
  }

  const thesisId = searchParams.get("thesisId") ?? undefined;
  const projectSlug = searchParams.get("projectSlug") ?? undefined;
  const requestedPage = Number(searchParams.get("page") ?? "0") || null;

  const { source, results } = await getSourceContextRecords({
    sourcePath,
    thesisId,
    projectSlug,
    limit: 16,
  });

  const selected = requestedPage
    ? results.filter((result) => {
        const start = result.payload.page_start ?? 0;
        const end = result.payload.page_end ?? start;
        return requestedPage >= start && requestedPage <= end;
      })
    : results;
  const visibleResults = selected.length > 0 ? selected : results;
  const first = visibleResults[0] ?? results[0];
  const title = first?.payload.title ?? sourcePath;

  const chunksHtml = visibleResults
    .map((result) => {
      const payload = result.payload;
      return `<article class="chunk">
  <div class="chunk-meta">
    <span>${escapeHtml(payload.citation_label)}</span>
    <span>${escapeHtml(pageLabel(payload.page_start, payload.page_end))}</span>
    <span>${escapeHtml(payload.document_type)}</span>
  </div>
  <p>${escapeHtml(result.text).replaceAll("\n", "<br />")}</p>
</article>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Archivbeleg</title>
  <style>
    :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; background: Canvas; color: CanvasText; }
    main { max-width: 920px; margin: 0 auto; padding: 32px 20px 48px; }
    header { border-bottom: 1px solid color-mix(in srgb, CanvasText 14%, transparent); margin-bottom: 20px; padding-bottom: 18px; }
    h1 { font-size: 22px; line-height: 1.25; margin: 0 0 10px; }
    .meta { color: color-mix(in srgb, CanvasText 62%, transparent); font-size: 13px; line-height: 1.55; overflow-wrap: anywhere; }
    .chunk { border: 1px solid color-mix(in srgb, CanvasText 14%, transparent); border-radius: 8px; margin: 14px 0; padding: 16px; background: color-mix(in srgb, Canvas 96%, CanvasText 4%); }
    .chunk-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
    .chunk-meta span { border: 1px solid color-mix(in srgb, CanvasText 14%, transparent); border-radius: 999px; padding: 3px 8px; font-size: 12px; color: color-mix(in srgb, CanvasText 70%, transparent); }
    p { font-size: 14px; line-height: 1.7; margin: 0; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">Quelle: ${escapeHtml(sourcePath)}</div>
      <div class="meta">Projekt: ${escapeHtml(projectSlug)} · Thesis: ${escapeHtml(thesisId)} · Retrieval: ${escapeHtml(source)}</div>
    </header>
    ${chunksHtml || "<p>Keine Textstellen gefunden.</p>"}
  </main>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
