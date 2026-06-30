import { tool } from "ai";
import { z } from "zod";
import {
  getThesisContextRecords,
  searchPriorWorkRecords,
  summarizeRetrievalResults,
} from "@/lib/retrieval/service";

const documentTypeSchema = z.enum([
  "thesis",
  "report",
  "planning",
  "proposal",
  "presentation",
  "poster",
  "idea",
  "pdf-other",
  "word-document",
]);

function sourceUrl(
  result: Awaited<ReturnType<typeof searchPriorWorkRecords>>["results"][number]
) {
  const params = new URLSearchParams({
    sourcePath: result.payload.source_path,
  });

  if (result.payload.thesis_id) {
    params.set("thesisId", result.payload.thesis_id);
  }
  if (result.payload.project_slug) {
    params.set("projectSlug", result.payload.project_slug);
  }
  if (result.payload.page_start) {
    params.set("page", String(result.payload.page_start));
  }

  return `/api/prior-work/source?${params.toString()}`;
}

function serializeResults(
  results: Awaited<ReturnType<typeof searchPriorWorkRecords>>["results"]
) {
  return results.map((result) => ({
    id: result.id,
    score: result.score,
    excerpt: result.text?.slice(0, 900) ?? null,
    citation: result.payload.citation_label,
    thesisId: result.payload.thesis_id,
    projectSlug: result.payload.project_slug,
    title: result.payload.title,
    documentType: result.payload.document_type,
    sourcePath: result.payload.source_path,
    pageStart: result.payload.page_start,
    pageEnd: result.payload.page_end,
    sourceUrl: sourceUrl(result),
  }));
}

export const searchPriorWork = tool({
  description:
    "Search the approved prior thesis corpus. Use this before proposing thesis ideas, comparing past work, or making claims about what the archive contains. Returns cited excerpts plus sourceUrl links; ideas must be grounded in these results, not generic examples.",
  inputSchema: z.object({
    query: z.string().min(2).describe("Natural-language search query."),
    projectSlug: z
      .string()
      .optional()
      .describe("Optional project slug filter, such as airchif or roomsense."),
    documentTypes: z
      .array(documentTypeSchema)
      .optional()
      .describe("Optional document type filters."),
    language: z
      .string()
      .optional()
      .describe("Optional language filter, e.g. de or en."),
    limit: z.number().int().min(1).max(12).default(6),
  }),
  execute: async ({ query, projectSlug, documentTypes, language, limit }) => {
    const { source, results } = await searchPriorWorkRecords({
      query,
      filters: { projectSlug, documentTypes, language },
      limit,
    });

    return {
      source,
      query,
      results: serializeResults(results),
      evidence: summarizeRetrievalResults(results),
    };
  },
});

export const getThesisById = tool({
  description:
    "Get context chunks for a known thesis or project slug from the prior-work corpus. Use this for Build-on-top flows after a thesis/project is selected.",
  inputSchema: z.object({
    thesisId: z
      .string()
      .optional()
      .describe("Known thesis id, e.g. thesis-airchif."),
    projectSlug: z
      .string()
      .optional()
      .describe("Known project slug, e.g. airchif."),
    limit: z.number().int().min(1).max(16).default(10),
  }),
  execute: async ({ thesisId, projectSlug, limit }) => {
    const { source, results } = await getThesisContextRecords({
      thesisId,
      projectSlug,
      limit,
    });

    return {
      source,
      thesisId,
      projectSlug,
      results: serializeResults(results),
      evidence: summarizeRetrievalResults(results),
    };
  },
});

export const findThesisExtensions = tool({
  description:
    "Find cited extension opportunities by searching future-work, risks, limitations, methodology, and related-work evidence for a selected thesis/project. Use returned excerpts and sourceUrl links as the direct basis for build-on-top ideas.",
  inputSchema: z.object({
    projectSlug: z
      .string()
      .optional()
      .describe("Optional project slug to focus on."),
    thesisId: z.string().optional().describe("Optional thesis id to focus on."),
    focus: z
      .string()
      .optional()
      .describe("Optional student interest or technical direction."),
    limit: z.number().int().min(1).max(12).default(6),
  }),
  execute: async ({ projectSlug, thesisId, focus, limit }) => {
    const query = [
      "future work limitations risks methodology extension follow-up related work",
      focus,
      thesisId,
      projectSlug,
    ]
      .filter(Boolean)
      .join(" ");
    const { source, results } = await searchPriorWorkRecords({
      query,
      filters: { projectSlug, thesisId },
      limit,
    });

    return {
      source,
      query,
      thesisId,
      projectSlug,
      results: serializeResults(results),
      evidence: summarizeRetrievalResults(results),
    };
  },
});
