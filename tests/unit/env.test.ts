import { describe, expect, it } from "vitest";
import { projectEnvDefaults, validateProjectEnv } from "../../lib/env/project";

const validEnv = {
  AUTH_SECRET: "local-auth-secret",
  BLOB_READ_WRITE_TOKEN: "local-blob-token",
  POSTGRES_URL: "postgres://user:password@localhost:5432/thesis_ideas",
  REDIS_URL: "redis://localhost:6379",
  QDRANT_URL: "https://example.qdrant.tech",
  QDRANT_API_KEY: "local-qdrant-key",
  GEMINI_API_KEY: "local-gemini-key",
};

describe("validateProjectEnv", () => {
  it("accepts a complete local environment and applies project defaults", () => {
    const result = validateProjectEnv(validEnv);

    expect(result.ok).toBe(true);
    expect(result.env?.QDRANT_COLLECTION).toBe(
      projectEnvDefaults.QDRANT_COLLECTION
    );
    expect(result.env?.GEMINI_CHAT_MODEL).toBe(
      projectEnvDefaults.GEMINI_CHAT_MODEL
    );
    expect(result.env?.GEMINI_EMBEDDING_MODEL).toBe(
      projectEnvDefaults.GEMINI_EMBEDDING_MODEL
    );
    expect(result.env?.GATEWAY_CHAT_MODEL).toBe(
      projectEnvDefaults.GATEWAY_CHAT_MODEL
    );
  });

  it("rejects missing cloud secrets", () => {
    const result = validateProjectEnv({
      ...validEnv,
      QDRANT_API_KEY: undefined,
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual({
      key: "QDRANT_API_KEY",
      message: "Missing required value.",
      level: "error",
    });
  });

  it("allows placeholders only for example-file validation", () => {
    const result = validateProjectEnv(
      {
        ...validEnv,
        AUTH_SECRET: "****",
        POSTGRES_URL: "****",
      },
      { allowPlaceholders: true }
    );

    expect(result.ok).toBe(true);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "AUTH_SECRET", level: "warning" }),
        expect.objectContaining({ key: "POSTGRES_URL", level: "warning" }),
      ])
    );
  });

  it("rejects unsupported Gemini chat model identifiers", () => {
    const result = validateProjectEnv({
      ...validEnv,
      GEMINI_CHAT_MODEL: "gemini-2.5-flash",
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "GEMINI_CHAT_MODEL" }),
      ])
    );
  });

  it("rejects unsupported Gateway chat model identifiers", () => {
    const result = validateProjectEnv({
      ...validEnv,
      GATEWAY_CHAT_MODEL: "anthropic/claude-sonnet-4.5",
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "GATEWAY_CHAT_MODEL" }),
      ])
    );
  });

  it("rejects unsupported Gemini embedding model identifiers", () => {
    const result = validateProjectEnv({
      ...validEnv,
      GEMINI_EMBEDDING_MODEL: "text-embedding-004",
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "GEMINI_EMBEDDING_MODEL" }),
      ])
    );
  });
});
