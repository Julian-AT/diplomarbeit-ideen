import { gateway } from "ai";
import { headers } from "next/headers";
import {
  type ChatModel,
  type GatewayModelEntryLike,
  gatewayChatModels,
  gatewayEntryToChatModel,
  getActiveModels,
  getCapabilitiesForModels,
  getDefaultChatModel,
  isGatewayAvailable,
  prioritizeChatModels,
} from "@/lib/ai/models";

type GatewayCreditsLike = {
  balance?: string | null;
  totalUsed?: string | null;
  total_used?: string | null;
};

const GATEWAY_CONFIG_URL = "https://ai-gateway.vercel.sh/v3/ai/config";

function hasPositiveGatewayBalance(
  credits: GatewayCreditsLike | null
): boolean {
  const balance = Number.parseFloat(credits?.balance ?? "0");
  return Number.isFinite(balance) && balance > 0;
}

function gatewayAuthHeaders(): Record<string, string> | null {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();
  const token = apiKey || oidcToken;

  if (!token) {
    return null;
  }

  return {
    "ai-gateway-auth-method": apiKey ? "api-key" : "oidc",
    "ai-gateway-protocol-version": "0.0.1",
    Authorization: `Bearer ${token}`,
  };
}

function isGatewayEntry(value: unknown): value is GatewayModelEntryLike {
  if (!(value && typeof value === "object")) {
    return false;
  }

  const entry = value as { id?: unknown; name?: unknown };
  return typeof entry.id === "string" && typeof entry.name === "string";
}

async function getGatewayUsageAvailable(): Promise<boolean> {
  try {
    const credits = await gateway.getCredits();
    return hasPositiveGatewayBalance(credits);
  } catch (_) {
    return false;
  }
}

async function getAvailableGatewayModelsFromConfig(): Promise<ChatModel[]> {
  const authHeaders = gatewayAuthHeaders();
  if (!authHeaders) {
    return [];
  }

  try {
    const response = await fetch(GATEWAY_CONFIG_URL, {
      headers: authHeaders,
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { models?: unknown };
    if (!Array.isArray(payload.models)) {
      return [];
    }

    return payload.models.flatMap((entry) => {
      if (!isGatewayEntry(entry)) {
        return [];
      }

      const model = gatewayEntryToChatModel(entry);
      return model ? [model] : [];
    });
  } catch (_) {
    return [];
  }
}

async function getAvailableGatewayModels(): Promise<ChatModel[]> {
  try {
    const metadata = await gateway.getAvailableModels();
    return metadata.models.flatMap((entry) => {
      const model = gatewayEntryToChatModel(entry);
      return model ? [model] : [];
    });
  } catch (_) {
    return getAvailableGatewayModelsFromConfig();
  }
}

export async function GET() {
  await headers();
  const responseHeaders = {
    "Cache-Control": "private, max-age=30",
  };

  const gatewayAvailable = isGatewayAvailable();
  const [gatewayUsageAvailable, discoveredGatewayModels] = gatewayAvailable
    ? await Promise.all([
        getGatewayUsageAvailable(),
        getAvailableGatewayModels(),
      ])
    : [false, [] as ChatModel[]];

  const models = gatewayAvailable
    ? prioritizeChatModels([...gatewayChatModels, ...discoveredGatewayModels])
    : getActiveModels();

  return Response.json(
    {
      capabilities: getCapabilitiesForModels(models),
      defaultModelId: getDefaultChatModel(process.env, {
        gatewayUsageAvailable,
      }),
      gateway: {
        available: gatewayAvailable,
        modelSource:
          discoveredGatewayModels.length > 0 ? "gateway" : "fallback",
        usageAvailable: gatewayUsageAvailable,
      },
      models,
    },
    { headers: responseHeaders }
  );
}
