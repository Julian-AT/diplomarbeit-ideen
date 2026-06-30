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

export type GatewayEnv = Record<string, string | undefined>;

export type GatewayModelEntryLike = {
  id: string;
  name?: string | null;
  description?: string | null;
  modelType?: string | null;
  specification?: {
    provider?: string;
    modelId?: string;
  };
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

export const gatewayChatModels: ChatModel[] = [
  gatewaySonnetModel,
  gatewayGeminiModel,
];

const fallbackGatewayModelIds = new Set(
  gatewayChatModels.map((model) => model.id)
);
const directModelIds = new Set(chatModels.map((model) => model.id));

export function isGatewayModelId(modelId: string): boolean {
  return modelId.includes("/") && !directModelIds.has(modelId);
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
  const configured = env.GATEWAY_CHAT_MODEL?.trim();
  return configured && isGatewayModelId(configured)
    ? configured
    : GATEWAY_SONNET_CHAT_MODEL;
}

export function getDefaultChatModel(
  env: GatewayEnv = process.env,
  options: { gatewayUsageAvailable?: boolean } = {}
) {
  return isGatewayAvailable(env) && options.gatewayUsageAvailable === true
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

  return prioritizeChatModels(gatewayChatModels);
}

export function getCapabilities(
  env: GatewayEnv = process.env
): Record<string, ModelCapabilities> {
  return getCapabilitiesForModels(getActiveModels(env));
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
  if (isDirectGoogleModelId(modelId)) {
    return true;
  }

  return isGatewayAvailable(env) && isGatewayModelId(modelId);
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

function prettifyModelName(modelId: string): string {
  return (
    modelId
      .split("/")
      .at(-1)
      ?.split(/[-_.]/)
      .filter(Boolean)
      .map((part) =>
        /^\d/.test(part)
          ? part
          : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`
      )
      .join(" ") ?? modelId
  );
}

function inferGatewayCapabilities(modelId: string): ModelCapabilities {
  const normalized = modelId.toLowerCase();
  const vision =
    /vision|vl|image|gemini|claude|gpt-4o|gpt-5|grok-2-vision|qwen3-vl/.test(
      normalized
    );
  const reasoning =
    /sonnet|opus|reasoning|thinking|gpt-5|o[134]|gemini-3|deepseek-r1|grok-4|qwen3.*thinking/.test(
      normalized
    );

  return { tools: true, vision, reasoning };
}

export function getModelCapabilities(modelId: string): ModelCapabilities {
  const knownModel = [...chatModels, ...gatewayChatModels].find(
    (model) => model.id === modelId
  );

  if (knownModel) {
    return knownModel.capabilities;
  }

  if (isGatewayModelId(modelId)) {
    return inferGatewayCapabilities(modelId);
  }

  return { tools: false, vision: false, reasoning: false };
}

export function gatewayEntryToChatModel(
  entry: GatewayModelEntryLike
): ChatModel | null {
  if (entry.modelType && entry.modelType !== "language") {
    return null;
  }

  const id = entry.id.trim();
  if (!id) {
    return null;
  }

  const provider = id.includes("/")
    ? id.split("/")[0]
    : (entry.specification?.provider ?? "ai");

  return {
    id,
    name: entry.name?.trim() || prettifyModelName(id),
    provider,
    description:
      entry.description?.trim() ||
      `AI Gateway language model ${prettifyModelName(id)}`,
    route: "gateway",
    capabilities: inferGatewayCapabilities(id),
  };
}

export function prioritizeChatModels(models: ChatModel[]): ChatModel[] {
  const merged = uniqueModels([directGeminiModel, ...models]);
  const byId = new Map(merged.map((model) => [model.id, model]));
  const preferred: ChatModel[] = [directGeminiModel];

  preferred.push(byId.get(GATEWAY_SONNET_CHAT_MODEL) ?? gatewaySonnetModel);

  const gatewayGemini = byId.get(GATEWAY_GEMINI_CHAT_MODEL);
  if (gatewayGemini) {
    preferred.push(gatewayGemini);
  }

  return uniqueModels([
    ...preferred,
    ...merged
      .filter((model) => model.id !== DIRECT_GEMINI_CHAT_MODEL)
      .sort((a, b) => {
        const providerComparison = a.provider.localeCompare(b.provider);
        return providerComparison || a.name.localeCompare(b.name);
      }),
  ]);
}

export function getCapabilitiesForModels(
  models: ChatModel[]
): Record<string, ModelCapabilities> {
  return Object.fromEntries(
    models.map((model) => [model.id, model.capabilities])
  );
}

export function isFallbackGatewayModelId(modelId: string): boolean {
  return fallbackGatewayModelIds.has(modelId);
}
