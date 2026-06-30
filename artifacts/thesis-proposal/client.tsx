import { toast } from "sonner";
import { Artifact } from "@/components/chat/create-artifact";
import { DiffView } from "@/components/chat/diffview";
import { DocumentSkeleton } from "@/components/chat/document-skeleton";
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
} from "@/components/chat/icons";
import { Editor } from "@/components/chat/text-editor";

type ThesisProposalMetadata = Record<string, never>;

export const thesisProposalArtifact = new Artifact<
  "thesis-proposal",
  ThesisProposalMetadata
>({
  kind: "thesis-proposal",
  description: "Cited diploma-thesis proposal grounded in prior archive work.",
  initialize: ({ setMetadata }) => {
    setMetadata({});
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-textDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 400 &&
          draftArtifact.content.length < 450
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    if (mode === "diff") {
      const selectedContent = getDocumentContentById(currentVersionIndex);
      const prevContent =
        currentVersionIndex > 0
          ? getDocumentContentById(currentVersionIndex - 1)
          : selectedContent;

      return (
        <div className="flex flex-row px-4 py-8 md:px-16 md:py-12 lg:px-20">
          <DiffView newContent={selectedContent} oldContent={prevContent} />
        </div>
      );
    }

    return (
      <div className="flex flex-row px-4 py-8 md:px-16 md:py-12 lg:px-20">
        <Editor
          content={content}
          currentVersionIndex={currentVersionIndex}
          isCurrentVersion={isCurrentVersion}
          onSaveContent={onSaveContent}
          status={status}
          suggestions={[]}
        />
      </div>
    );
  },
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: "View changes",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("toggle");
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <UndoIcon size={18} />,
      description: "View previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      icon: <PenIcon />,
      description: "Tighten scope",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Tighten the thesis proposal scope, keep citations intact, and make the deliverables more concrete.",
            },
          ],
        });
      },
    },
    {
      icon: <MessageIcon />,
      description: "Check citations",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Check the thesis proposal citations against the retrieved prior-work evidence and flag unsupported claims.",
            },
          ],
        });
      },
    },
  ],
});
