export const DIRECT_GEMINI_CHAT_MODEL = "gemini-3.5-flash";
export const GATEWAY_GEMINI_CHAT_MODEL = "google/gemini-3.5-flash";
export const GATEWAY_SONNET_CHAT_MODEL = "anthropic/claude-sonnet-5";

export const DEFAULT_CHAT_MODEL = DIRECT_GEMINI_CHAT_MODEL;

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModelRoute = "direct-google" | "gateway";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  route: ChatModelRoute;
  capabilities: ModelCapabilities;
};

export const titleModel: ChatModel = {
  id: DIRECT_GEMINI_CHAT_MODEL,
  name: "Gemini 3.5 Flash",
  provider: "google",
  description: "Fast title generation through the Gemini Interactions API",
  route: "direct-google",
  capabilities: { tools: false, vision: false, reasoning: false },
};

const directGeminiModel: ChatModel = {
  id: DIRECT_GEMINI_CHAT_MODEL,
  name: "Gemini 3.5 Flash",
  provider: "google",
  description:
    "Direct Google API key path for grounded German Diplomarbeit ideation over the archive",
  route: "direct-google",
  capabilities: { tools: true, vision: true, reasoning: false },
};

const gatewaySonnetModel: ChatModel = {
  id: GATEWAY_SONNET_CHAT_MODEL,
  name: "Claude Sonnet 5",
  provider: "anthropic",
  description:
    "AI Gateway model for the highest-quality archive-grounded ideation when Gateway credits are available",
  route: "gateway",
  capabilities: { tools: true, vision: true, reasoning: true },
};

const gatewayGeminiModel: ChatModel = {
  id: GATEWAY_GEMINI_CHAT_MODEL,
  name: "Gemini 3.5 Flash (Gateway)",
  provider: "google",
  description:
    "Gemini 3.5 Flash through Vercel AI Gateway, useful when Gateway routing and observability are desired",
  route: "gateway",
  capabilities: { tools: true, vision: true, reasoning: true },
};

export const chatModels: ChatModel[] = [directGeminiModel];

type GatewayEnv = Record<string, string | undefined>;

export const gatewayChatModels: ChatModel[] = [
  gatewaySonnetModel,
  gatewayGeminiModel,
];

const gatewayModelIds = new Set(gatewayChatModels.map((model) => model.id));
const directModelIds = new Set(chatModels.map((model) => model.id));

export function isGatewayModelId(modelId: string): boolean {
  return gatewayModelIds.has(modelId);
}

export function isDirectGoogleModelId(modelId: string): boolean {
  return directModelIds.has(modelId);
}

export function isGatewayAvailable(env: GatewayEnv = process.env): boolean {
  return Boolean(
    env.AI_GATEWAY_API_KEY?.trim() || env.VERCEL_OIDC_TOKEN?.trim()
  );
}

function configuredGatewayDefault(env: GatewayEnv): string {
  return gatewayModelIds.has(env.GATEWAY_CHAT_MODEL ?? "")
    ? String(env.GATEWAY_CHAT_MODEL)
    : GATEWAY_SONNET_CHAT_MODEL;
}

export function getDefaultChatModel(env: GatewayEnv = process.env) {
  return isGatewayAvailable(env)
    ? configuredGatewayDefault(env)
    : DEFAULT_CHAT_MODEL;
}

function uniqueModels(models: ChatModel[]): ChatModel[] {
  const seen = new Set<string>();
  return models.filter((model) => {
    if (seen.has(model.id)) {
      return false;
    }
    seen.add(model.id);
    return true;
  });
}

export function getActiveModels(env: GatewayEnv = process.env): ChatModel[] {
  if (!isGatewayAvailable(env)) {
    return chatModels;
  }

  const gatewayDefault = configuredGatewayDefault(env);
  const orderedGatewayModels = [
    gatewayChatModels.find((model) => model.id === gatewayDefault) ??
      gatewaySonnetModel,
    ...gatewayChatModels,
  ];

  return uniqueModels([...orderedGatewayModels, directGeminiModel]);
}

export function getCapabilities(
  env: GatewayEnv = process.env
): Record<string, ModelCapabilities> {
  return Object.fromEntries(
    getActiveModels(env).map((model) => [model.id, model.capabilities])
  );
}

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export function getAllGatewayModels(): GatewayModelWithCapabilities[] {
  return gatewayChatModels;
}

export function getAllowedModelIds(env: GatewayEnv = process.env) {
  return new Set(getActiveModels(env).map((model) => model.id));
}

export function isAllowedChatModelId(
  modelId: string,
  env: GatewayEnv = process.env
): boolean {
  return getAllowedModelIds(env).has(modelId);
}

export const allowedModelIds = new Set([
  ...chatModels.map((model) => model.id),
  ...gatewayChatModels.map((model) => model.id),
]);

export const modelsByProvider = getActiveModels().reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
