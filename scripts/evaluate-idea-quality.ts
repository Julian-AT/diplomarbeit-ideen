import { readFile } from "node:fs/promises";
import { evaluateProposalMarkdown } from "../lib/quality/idea-quality";

function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

async function main() {
  const filePath = readArg("--file");
  const thresholdArg = readArg("--threshold");
  const threshold = thresholdArg
    ? Number.parseInt(thresholdArg, 10)
    : undefined;

  if (!filePath) {
    console.error(
      "Usage: pnpm quality:proposal --file <proposal.md> [--threshold 75]"
    );
    process.exit(2);
  }

  const markdown = await readFile(filePath, "utf8");
  const report = evaluateProposalMarkdown(markdown, { threshold });
  console.log(JSON.stringify(report, null, 2));

  if (!report.passed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
