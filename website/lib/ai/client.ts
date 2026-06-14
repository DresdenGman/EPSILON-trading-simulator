import { createOpenAI } from "@ai-sdk/openai";

/**
 * DeepSeek API client configured via the OpenAI-compatible provider.
 * Uses @ai-sdk/openai with baseURL pointed at DeepSeek.
 */
export const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY ?? "sk-placeholder",
});

/**
 * Default models for different use cases:
 * - chat: General-purpose reasoning (deepseek-chat)
 * - reasoner: Advanced reasoning with chain-of-thought (deepseek-reasoner)
 */
export const MODELS = {
  chat: "deepseek-chat",
  reasoner: "deepseek-reasoner",
} as const;
