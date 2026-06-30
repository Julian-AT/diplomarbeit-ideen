export const DEFAULT_CHAT_MODEL = "gemini-3.5-flash";

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: ModelCapabilities;
};

export const titleModel: ChatModel = {
  id: DEFAULT_CHAT_MODEL,
  name: "Gemini 3.5 Flash",
  provider: "google",
  description: "Fast title generation through the Gemini Interactions API",
  capabilities: { tools: false, vision: false, reasoning: false },
};

export const chatModels: ChatModel[] = [
  {
    id: DEFAULT_CHAT_MODEL,
    name: "Gemini 3.5 Flash",
    provider: "google",
    description:
      "Default German-first model for grounded Diplomarbeit ideation over the prior thesis archive",
    capabilities: { tools: true, vision: true, reasoning: false },
  },
];

export function getCapabilities(): Record<string, ModelCapabilities> {
  return Object.fromEntries(
    chatModels.map((model) => [model.id, model.capabilities])
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export function getAllGatewayModels(): GatewayModelWithCapabilities[] {
  return chatModels;
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
