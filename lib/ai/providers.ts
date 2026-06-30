import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { customProvider, gateway } from "ai";
import { isTestEnvironment } from "../constants";
import { isGatewayModelId, titleModel } from "./models";

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

function getGoogleProvider() {
  return createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
}

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  if (isGatewayModelId(modelId)) {
    return gateway(modelId);
  }

  return getGoogleProvider().interactions(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  return getGoogleProvider().interactions(titleModel.id);
}
