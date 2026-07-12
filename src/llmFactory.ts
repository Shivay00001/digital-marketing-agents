import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";

dotenv.config();

export function getLLM() {
  // Default to gpt4free if not specified
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
      apiKey: "dummy-key-for-g4f" // g4f doesn't require a real key
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
      modelName: "llama3-70b-8192", // Example Groq model
      temperature: 0.1,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
      apiKey: process.env.GROQ_API_KEY || "missing-groq-key"
    });
  }

  // Fallback
  throw new Error(`Unsupported LLM_PROVIDER: ${provider}. Please check your .env file.`);
}
