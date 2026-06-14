import { streamText } from "ai";
import { deepseek, MODELS } from "@/lib/ai/client";
import { tavilySearch, formatSearchResults } from "@/lib/search/tavily";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, searchEnabled } = await req.json();

    let searchContext = "";
    if (searchEnabled) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m: { role: string }) => m.role === "user");
      if (lastUserMessage?.content) {
        try {
          const searchResult = await tavilySearch({
            query: lastUserMessage.content.slice(0, 400),
            searchDepth: "basic",
            maxResults: 3,
          });
          searchContext = formatSearchResults(searchResult);
        } catch {
          // Search failure is non-fatal
        }
      }
    }

    const systemMessage = searchContext
      ? {
          role: "system" as const,
          content: `You are EPSILON AI, a professional quantitative trading strategy advisor. Use the following real-time web search results to provide evidence-based answers:\n\n${searchContext}`,
        }
      : {
          role: "system" as const,
          content:
            "You are EPSILON AI, a professional quantitative trading strategy advisor. Provide data-driven analysis, strategy diagnosis, and actionable improvement suggestions. Explain technical terms in plain language.",
        };

    const result = streamText({
      model: deepseek(MODELS.chat),
      messages: [systemMessage, ...messages],
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
