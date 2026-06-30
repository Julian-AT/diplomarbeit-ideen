import { describe, expect, it } from "vitest";
import {
  DEFAULT_CHAT_MODEL,
  GATEWAY_GEMINI_CHAT_MODEL,
  GATEWAY_SONNET_CHAT_MODEL,
  gatewayEntryToChatModel,
  getActiveModels,
  getDefaultChatModel,
  isAllowedChatModelId,
  isGatewayModelId,
  prioritizeChatModels,
} from "../../lib/ai/models";

describe("AI model routing", () => {
  it("defaults to direct Gemini without AI Gateway credentials", () => {
    const env = {};

    expect(getDefaultChatModel(env)).toBe(DEFAULT_CHAT_MODEL);
    expect(getActiveModels(env).map((model) => model.id)).toEqual([
      DEFAULT_CHAT_MODEL,
    ]);
  });

  it("keeps Gemini first and default when Gateway has no usable credits", () => {
    const env = { AI_GATEWAY_API_KEY: "gateway-key" };
    const activeModels = getActiveModels(env).map((model) => model.id);

    expect(getDefaultChatModel(env)).toBe(DEFAULT_CHAT_MODEL);
    expect(activeModels[0]).toBe(DEFAULT_CHAT_MODEL);
    expect(activeModels[1]).toBe(GATEWAY_SONNET_CHAT_MODEL);
    expect(isAllowedChatModelId("openai/gpt-5", env)).toBe(true);
  });

  it("defaults to Sonnet 5 only when Gateway usage is available", () => {
    const env = { AI_GATEWAY_API_KEY: "gateway-key" };

    expect(getDefaultChatModel(env, { gatewayUsageAvailable: true })).toBe(
      GATEWAY_SONNET_CHAT_MODEL
    );
    expect(isAllowedChatModelId(GATEWAY_SONNET_CHAT_MODEL, env)).toBe(true);
    expect(isGatewayModelId(GATEWAY_SONNET_CHAT_MODEL)).toBe(true);
  });

  it("prioritizes direct Gemini, Sonnet 5, Gateway Gemini, then discovered models", () => {
    const discovered = gatewayEntryToChatModel({
      id: "openai/gpt-5",
      name: "GPT-5",
      modelType: "language",
      specification: { provider: "openai", modelId: "gpt-5" },
    });

    if (!discovered) {
      throw new Error("Expected Gateway model conversion to return a model");
    }

    const ordered = prioritizeChatModels([
      discovered,
      {
        id: GATEWAY_GEMINI_CHAT_MODEL,
        name: "Gemini 3.5 Flash (Gateway)",
        provider: "google",
        description: "Gateway Gemini",
        route: "gateway",
        capabilities: { tools: true, vision: true, reasoning: true },
      },
    ]).map((model) => model.id);

    expect(ordered.slice(0, 4)).toEqual([
      DEFAULT_CHAT_MODEL,
      GATEWAY_SONNET_CHAT_MODEL,
      GATEWAY_GEMINI_CHAT_MODEL,
      "openai/gpt-5",
    ]);
  });
});
