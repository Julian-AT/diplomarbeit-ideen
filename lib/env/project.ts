import { z } from "zod";

export const geminiEmbeddingModels = [
  "gemini-embedding-2-preview",
  "gemini-embedding-001",
] as const;

export const geminiChatModels = ["gemini-3.5-flash"] as const;

export const gatewayChatModels = [
  "anthropic/claude-sonnet-5",
  "google/gemini-3.5-flash",
] as const;

export const projectEnvKeys = [
  "AUTH_SECRET",
  "BLOB_READ_WRITE_TOKEN",
  "POSTGRES_URL",
  "REDIS_URL",
  "QDRANT_URL",
  "QDRANT_API_KEY",
  "QDRANT_COLLECTION",
  "GEMINI_API_KEY",
  "GEMINI_CHAT_MODEL",
  "GEMINI_EMBEDDING_MODEL",
  "AI_GATEWAY_API_KEY",
  "GATEWAY_CHAT_MODEL",
] as const;

export const requiredProjectEnvKeys = [
  "AUTH_SECRET",
  "BLOB_READ_WRITE_TOKEN",
  "POSTGRES_URL",
  "REDIS_URL",
  "QDRANT_URL",
  "QDRANT_API_KEY",
  "GEMINI_API_KEY",
] as const;

export const projectEnvDefaults = {
  QDRANT_COLLECTION: "thesis_ideas",
  GEMINI_CHAT_MODEL: "gemini-3.5-flash",
  GEMINI_EMBEDDING_MODEL: "gemini-embedding-2-preview",
  GATEWAY_CHAT_MODEL: "anthropic/claude-sonnet-5",
} as const;

type ProjectEnvKey = (typeof projectEnvKeys)[number];

export type GeminiEmbeddingModel = (typeof geminiEmbeddingModels)[number];
export type GeminiChatModel = (typeof geminiChatModels)[number];
export type GatewayChatModel = (typeof gatewayChatModels)[number];
export type ProjectEnvIssue = {
  key: ProjectEnvKey | "ENV_FILE";
  message: string;
  level: "error" | "warning";
};

const qdrantCollectionPattern = /^[a-zA-Z0-9_-]+$/;
const placeholderPattern = /^(\*+|change-?me|todo|your[-_].*|example[-_].*)$/i;
const requiredProjectEnvSet = new Set<string>(requiredProjectEnvKeys);

function urlWithProtocols(protocols: string[]) {
  return z
    .string()
    .url()
    .refine(
      (value) => {
        try {
          return protocols.includes(new URL(value).protocol);
        } catch {
          return false;
        }
      },
      { message: `Must use one of these protocols: ${protocols.join(", ")}` }
    );
}

export const projectEnvSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  POSTGRES_URL: urlWithProtocols(["postgres:", "postgresql:"]),
  REDIS_URL: urlWithProtocols(["redis:", "rediss:"]),
  QDRANT_URL: z.string().url(),
  QDRANT_API_KEY: z.string().min(1),
  QDRANT_COLLECTION: z
    .string()
    .min(1)
    .regex(qdrantCollectionPattern, {
      message: "Use only letters, numbers, underscores, and hyphens.",
    })
    .default(projectEnvDefaults.QDRANT_COLLECTION),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_CHAT_MODEL: z
    .enum(geminiChatModels)
    .default(projectEnvDefaults.GEMINI_CHAT_MODEL),
  GEMINI_EMBEDDING_MODEL: z
    .enum(geminiEmbeddingModels)
    .default(projectEnvDefaults.GEMINI_EMBEDDING_MODEL),
  AI_GATEWAY_API_KEY: z.string().optional(),
  GATEWAY_CHAT_MODEL: z
    .enum(gatewayChatModels)
    .default(projectEnvDefaults.GATEWAY_CHAT_MODEL),
});

export type ProjectEnv = z.infer<typeof projectEnvSchema>;
export type ProjectEnvValidation = {
  ok: boolean;
  env?: ProjectEnv;
  issues: ProjectEnvIssue[];
  checkedKeys: readonly ProjectEnvKey[];
};

export function isPlaceholderValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return placeholderPattern.test(value.trim());
}

function replacementFor(key: ProjectEnvKey): string {
  switch (key) {
    case "POSTGRES_URL":
      return "postgres://user:password@localhost:5432/thesis_ideas";
    case "REDIS_URL":
      return "redis://localhost:6379";
    case "QDRANT_URL":
      return "https://example.qdrant.tech";
    case "QDRANT_COLLECTION":
      return projectEnvDefaults.QDRANT_COLLECTION;
    case "GEMINI_CHAT_MODEL":
      return projectEnvDefaults.GEMINI_CHAT_MODEL;
    case "GEMINI_EMBEDDING_MODEL":
      return projectEnvDefaults.GEMINI_EMBEDDING_MODEL;
    case "GATEWAY_CHAT_MODEL":
      return projectEnvDefaults.GATEWAY_CHAT_MODEL;
    default:
      return "placeholder-secret";
  }
}

function issueForPath(
  path: Array<string | number>,
  message: string
): ProjectEnvIssue {
  const key = String(path[0] ?? "ENV_FILE") as ProjectEnvKey | "ENV_FILE";

  return {
    key,
    message,
    level: "error",
  };
}

export function validateProjectEnv(
  input: Record<string, string | undefined>,
  options: { allowPlaceholders?: boolean } = {}
): ProjectEnvValidation {
  const allowPlaceholders = options.allowPlaceholders ?? false;
  const issues: ProjectEnvIssue[] = [];
  const candidate: Record<ProjectEnvKey, string | undefined> = {
    AUTH_SECRET: input.AUTH_SECRET,
    BLOB_READ_WRITE_TOKEN: input.BLOB_READ_WRITE_TOKEN,
    POSTGRES_URL: input.POSTGRES_URL,
    REDIS_URL: input.REDIS_URL,
    QDRANT_URL: input.QDRANT_URL,
    QDRANT_API_KEY: input.QDRANT_API_KEY,
    QDRANT_COLLECTION: input.QDRANT_COLLECTION,
    GEMINI_API_KEY: input.GEMINI_API_KEY,
    GEMINI_CHAT_MODEL: input.GEMINI_CHAT_MODEL,
    GEMINI_EMBEDDING_MODEL: input.GEMINI_EMBEDDING_MODEL,
    AI_GATEWAY_API_KEY: input.AI_GATEWAY_API_KEY,
    GATEWAY_CHAT_MODEL: input.GATEWAY_CHAT_MODEL,
  };

  for (const key of requiredProjectEnvKeys) {
    if (!candidate[key]?.trim()) {
      issues.push({ key, message: "Missing required value.", level: "error" });
    }
  }

  const schemaInput: Record<string, string | undefined> = { ...candidate };

  for (const key of projectEnvKeys) {
    if (!candidate[key]?.trim()) {
      if (requiredProjectEnvSet.has(key)) {
        schemaInput[key] = replacementFor(key);
      }
      continue;
    }

    if (isPlaceholderValue(candidate[key])) {
      schemaInput[key] = allowPlaceholders
        ? replacementFor(key)
        : candidate[key];
      issues.push({
        key,
        message: allowPlaceholders
          ? "Placeholder accepted for example validation."
          : "Replace placeholder before running the app.",
        level: allowPlaceholders ? "warning" : "error",
      });
    }
  }

  const parsed = projectEnvSchema.safeParse(schemaInput);

  if (!parsed.success) {
    issues.push(
      ...parsed.error.issues.map((issue) =>
        issueForPath(issue.path, issue.message)
      )
    );
  }

  const hasErrors = issues.some((issue) => issue.level === "error");

  return {
    ok: !hasErrors,
    env: parsed.success ? parsed.data : undefined,
    issues,
    checkedKeys: projectEnvKeys,
  };
}
