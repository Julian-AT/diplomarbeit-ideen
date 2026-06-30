import { describe, expect, it } from "vitest";
import {
  DEFAULT_CHAT_MODEL,
  GATEWAY_SONNET_CHAT_MODEL,
  getActiveModels,
  getDefaultChatModel,
  isAllowedChatModelId,
  isGatewayModelId,
} from "../../lib/ai/models";

describe("AI model routing", () => {
  it("defaults to direct Gemini without AI Gateway credentials", () => {
    const env = {};

    expect(getDefaultChatModel(env)).toBe(DEFAULT_CHAT_MODEL);
    expect(getActiveModels(env).map((model) => model.id)).toEqual([
      DEFAULT_CHAT_MODEL,
    ]);
  });

  it("defaults to Sonnet 5 and enables Gateway models when Gateway is configured", () => {
    const env = { AI_GATEWAY_API_KEY: "gateway-key" };

    expect(getDefaultChatModel(env)).toBe(GATEWAY_SONNET_CHAT_MODEL);
    expect(isAllowedChatModelId(GATEWAY_SONNET_CHAT_MODEL, env)).toBe(true);
    expect(isGatewayModelId(GATEWAY_SONNET_CHAT_MODEL)).toBe(true);
    expect(getActiveModels(env).map((model) => model.id)).toContain(
      DEFAULT_CHAT_MODEL
    );
  });
});
