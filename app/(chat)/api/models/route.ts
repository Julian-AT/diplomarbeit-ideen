import { headers } from "next/headers";
import {
  getActiveModels,
  getCapabilities,
  getDefaultChatModel,
} from "@/lib/ai/models";

export async function GET() {
  await headers();
  const responseHeaders = {
    "Cache-Control": "private, max-age=60",
  };

  const capabilities = getCapabilities();

  return Response.json(
    {
      capabilities,
      defaultModelId: getDefaultChatModel(),
      models: getActiveModels(),
    },
    { headers: responseHeaders }
  );
}
