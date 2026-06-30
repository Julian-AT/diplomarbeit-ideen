import { describe, expect, it } from "vitest";
import { evaluateProposalMarkdown } from "../../../lib/quality/idea-quality";

const groundedProposal = `# Adaptive Feedback for Programming Exercises

## Abstract
This diploma thesis proposes an adaptive feedback prototype for programming exercises.

## Related prior work
The proposal builds on Classroom Analytics, p. 4 and its archive implementation notes. Source path: archive/classroom-analytics/thesis.pdf.
A second comparison point is Exercise Tutor, pp. 8-9. Source path: archive/exercise-tutor/report.pdf.

## Research question
How can feedback timing be adapted without increasing teacher workload?

## Scope
The scope is a single course prototype with a small evaluation.

## Methodology
Implement the prototype, replay archived exercise data, and run a teacher review.

## Deliverables
A web prototype, evaluation report, and deployment notes.

## Risks and mitigations
The main risk is sparse data; mitigation is a fallback rule-based feedback mode.

## References
- Classroom Analytics, p. 4 - archive/classroom-analytics/thesis.pdf
- Exercise Tutor, pp. 8-9 - archive/exercise-tutor/report.pdf
`;

describe("evaluateProposalMarkdown", () => {
  it("passes a grounded proposal with sections, citations, and source paths", () => {
    const report = evaluateProposalMarkdown(groundedProposal);

    expect(report.passed).toBe(true);
    expect(report.score).toBeGreaterThanOrEqual(75);
    expect(report.citationCount).toBeGreaterThanOrEqual(2);
    expect(report.sourcePathCount).toBeGreaterThanOrEqual(1);
    expect(report.missingSections).toEqual([]);
  });

  it("fails a thin brainstorm without required grounding", () => {
    const report = evaluateProposalMarkdown(
      "A chatbot thesis could be interesting because students like AI."
    );

    expect(report.passed).toBe(false);
    expect(report.missingSections).toContain("Related prior work");
    expect(report.citationCount).toBe(0);
    expect(report.sourcePathCount).toBe(0);
  });
});
