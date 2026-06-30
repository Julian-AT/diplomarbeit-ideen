import { smoothStream, streamText } from "ai";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

const thesisProposalPrompt = `Create a cited diploma-thesis proposal in Markdown.

Required sections:
- Title
- Abstract
- Related prior work
- Research question
- Scope
- Methodology
- Deliverables
- Risks and mitigations
- References

Rules:
- Use only evidence supplied in the conversation or tool results.
- Preserve citation labels and source paths exactly when available.
- Call out uncertain or missing evidence instead of inventing references.
- Keep the proposal feasible for a software-engineering school diploma thesis.`;

export const thesisProposalDocumentHandler =
  createDocumentHandler<"thesis-proposal">({
    kind: "thesis-proposal",
    onCreateDocument: async ({ title, dataStream, modelId }) => {
      let draftContent = "";

      const { fullStream } = streamText({
        model: getLanguageModel(modelId),
        system: thesisProposalPrompt,
        experimental_transform: smoothStream({ chunking: "word" }),
        prompt: title,
      });

      for await (const delta of fullStream) {
        if (delta.type === "text-delta") {
          draftContent += delta.text;
          dataStream.write({
            type: "data-textDelta",
            data: delta.text,
            transient: true,
          });
        }
      }

      return draftContent;
    },
    onUpdateDocument: async ({
      document,
      description,
      dataStream,
      modelId,
    }) => {
      let draftContent = "";

      const { fullStream } = streamText({
        model: getLanguageModel(modelId),
        system: updateDocumentPrompt(document.content, "thesis-proposal"),
        experimental_transform: smoothStream({ chunking: "word" }),
        prompt: description,
      });

      for await (const delta of fullStream) {
        if (delta.type === "text-delta") {
          draftContent += delta.text;
          dataStream.write({
            type: "data-textDelta",
            data: delta.text,
            transient: true,
          });
        }
      }

      return draftContent;
    },
  });
