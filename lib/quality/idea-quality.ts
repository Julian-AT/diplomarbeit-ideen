export type ProposalQualityItem = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  detail: string;
};

export type ProposalQualityReport = {
  score: number;
  passed: boolean;
  threshold: number;
  items: ProposalQualityItem[];
  missingSections: string[];
  citationCount: number;
  sourcePathCount: number;
};

type SectionRule = {
  id: string;
  label: string;
  pattern: RegExp;
};

const requiredSections: SectionRule[] = [
  { id: "title", label: "Title", pattern: /^\s*(#\s+.+|title\s*:)/im },
  {
    id: "abstract",
    label: "Abstract",
    pattern: /^\s*#{1,3}\s*abstract\b|^\s*abstract\s*:/im,
  },
  {
    id: "related-prior-work",
    label: "Related prior work",
    pattern: /^\s*#{1,3}\s*related prior work\b|^\s*related prior work\s*:/im,
  },
  {
    id: "research-question",
    label: "Research question",
    pattern: /^\s*#{1,3}\s*research question\b|^\s*research question\s*:/im,
  },
  {
    id: "scope",
    label: "Scope",
    pattern: /^\s*#{1,3}\s*scope\b|^\s*scope\s*:/im,
  },
  {
    id: "methodology",
    label: "Methodology",
    pattern: /^\s*#{1,3}\s*methodology\b|^\s*methodology\s*:/im,
  },
  {
    id: "deliverables",
    label: "Deliverables",
    pattern: /^\s*#{1,3}\s*deliverables\b|^\s*deliverables\s*:/im,
  },
  {
    id: "risks",
    label: "Risks and mitigations",
    pattern:
      /^\s*#{1,3}\s*risks?( and mitigations)?\b|^\s*risks?( and mitigations)?\s*:/im,
  },
  {
    id: "references",
    label: "References",
    pattern: /^\s*#{1,3}\s*references\b|^\s*references\s*:/im,
  },
];

const citationPattern = /\[[^\]]+\]|\bpp?\.\s*\d+(?:\s*-\s*\d+)?/gi;
const sourcePathPattern = /[\w .()\-/\\]+\.(?:pdf|docx|pptx|png|mp4|mov)\b/gi;
const noveltyPattern =
  /\b(gap|novel|extension|extends|future work|builds on|research question|untersucht|erweitert)\b/i;
const feasibilityPattern =
  /\b(scope|deliverable|prototype|evaluation|methodology|risk|mitigation|feasible|semester|implement)\b/i;

function uniqueMatches(text: string, pattern: RegExp): string[] {
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches.map((match) => match.trim()))];
}

export function evaluateProposalMarkdown(
  markdown: string,
  options: { threshold?: number } = {}
): ProposalQualityReport {
  const threshold = options.threshold ?? 75;
  const content = markdown.trim();

  const sectionItems: ProposalQualityItem[] = requiredSections.map(
    (section) => {
      const passed = section.pattern.test(content);
      return {
        id: section.id,
        label: section.label,
        passed,
        weight: 8,
        detail: passed ? "Section present." : "Missing required section.",
      };
    }
  );

  const citations = uniqueMatches(content, citationPattern);
  const sourcePaths = uniqueMatches(content, sourcePathPattern);

  const evidenceItem: ProposalQualityItem = {
    id: "cited-evidence",
    label: "Cited evidence",
    passed: citations.length >= 2,
    weight: 10,
    detail:
      citations.length >= 2
        ? `Found ${citations.length} citation signals.`
        : "Need at least two citation labels or page references.",
  };

  const sourcePathItem: ProposalQualityItem = {
    id: "source-paths",
    label: "Source paths",
    passed: sourcePaths.length >= 1,
    weight: 8,
    detail:
      sourcePaths.length >= 1
        ? `Found ${sourcePaths.length} source path signal(s).`
        : "Need at least one source path from retrieval evidence.",
  };

  const noveltyItem: ProposalQualityItem = {
    id: "novelty-gap",
    label: "Novelty or gap",
    passed: noveltyPattern.test(content),
    weight: 5,
    detail: noveltyPattern.test(content)
      ? "Proposal frames a gap, extension, or research question."
      : "Proposal should explicitly frame the gap or extension beyond prior work.",
  };

  const feasibilityItem: ProposalQualityItem = {
    id: "feasibility",
    label: "Feasibility",
    passed: feasibilityPattern.test(content),
    weight: 5,
    detail: feasibilityPattern.test(content)
      ? "Proposal includes feasibility-oriented language."
      : "Proposal should describe scope, deliverables, evaluation, or risks.",
  };

  const items = [
    ...sectionItems,
    evidenceItem,
    sourcePathItem,
    noveltyItem,
    feasibilityItem,
  ];
  const maxWeightedScore = items.reduce(
    (total, item) => total + item.weight,
    0
  );
  const weightedScore = items.reduce(
    (total, item) => total + (item.passed ? item.weight : 0),
    0
  );
  const score = Math.round((weightedScore / maxWeightedScore) * 100);
  const missingSections = sectionItems
    .filter((item) => !item.passed)
    .map((item) => item.label);

  return {
    score,
    passed: score >= threshold,
    threshold,
    items,
    missingSections,
    citationCount: citations.length,
    sourcePathCount: sourcePaths.length,
  };
}
