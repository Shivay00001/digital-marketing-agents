import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";

dotenv.config();

export function getLLM() {
  const provider = (process.env.LLM_PROVIDER || "gpt4free").toLowerCase();

  console.log(`🤖 LLM Provider Active: [${provider.toUpperCase()}]`);

  if (provider === "gpt4free") {
    // gpt4free provides an OpenAI-compatible API.
    // You need to run `g4f api` in your terminal to start the local server.
    return new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.1,
      configuration: {
        baseURL: process.env.G4F_BASE_URL || "http://127.0.0.1:1337/v1",
      },
      apiKey: "dummy-key-for-g4f"
    });
  }
  
  if (provider === "openai") {
    return new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.1,
      apiKey: process.env.OPENAI_API_KEY || "missing-openai-key"
    });
  }

  if (provider === "groq") {
    // Groq is free and very fast, uses OpenAI compatible endpoint
    return new ChatOpenAI({
      modelName: "llama-3.1-8b-instant", // High rate limit on free tier
      temperature: 0.1,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
      apiKey: process.env.GROQ_API_KEY || "missing-groq-key"
    });
  }

  if (provider === "atomesus") {
    return new ChatOpenAI({
      modelName: "cipher", // Atomesus specific model
      temperature: 0.1,
      configuration: {
        baseURL: process.env.ATOMESUS_BASE_URL || "https://api.atomesus.com/v1",
      },
      apiKey: process.env.ATOMESUS_API_KEY || "missing-key"
    });
  }

  if (provider === "iamhc") {
    // NewAPI / OneAPI compatible proxy
    return new ChatOpenAI({
      modelName: "glm-4",
      temperature: 0.1,
      configuration: {
        baseURL: process.env.IAMHC_BASE_URL || "https://api.iamhc.cn/v1",
      },
      apiKey: process.env.IAMHC_API_KEY || "missing-key"
    });
  }

  // Fallback
  throw new Error(`Unsupported LLM_PROVIDER: ${provider}. Please check your .env file.`);
}
