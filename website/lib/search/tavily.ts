/**
 * Tavily Search API client for web evidence gathering.
 * Used by the AI analysis pipeline to collect real-time market context.
 *
 * API docs: https://docs.tavily.com
 */

interface TavilySearchParams {
  query: string;
  searchDepth?: "basic" | "advanced";
  includeAnswer?: boolean;
  maxResults?: number;
  includeImages?: boolean;
  includeRawContent?: boolean;
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  rawContent?: string;
}

interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilyResult[];
  responseTime: number;
}

const TAVILY_BASE_URL = "https://api.tavily.com/search";

export async function tavilySearch(
  params: TavilySearchParams
): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  const response = await fetch(TAVILY_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: params.query,
      search_depth: params.searchDepth ?? "basic",
      include_answer: params.includeAnswer ?? true,
      max_results: params.maxResults ?? 5,
      include_images: params.includeImages ?? false,
      include_raw_content: params.includeRawContent ?? false,
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`Tavily search failed: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Format Tavily search results into a compact context string for AI prompts.
 */
export function formatSearchResults(
  response: TavilySearchResponse
): string {
  const parts: string[] = [];

  if (response.answer) {
    parts.push(`### Search Answer\n${response.answer}\n`);
  }

  if (response.results.length > 0) {
    parts.push("### Web Results");
    for (const r of response.results.slice(0, 5)) {
      parts.push(
        `- [${r.title}](${r.url}) (score: ${r.score.toFixed(2)})\n  ${r.content.slice(0, 300)}`
      );
    }
  }

  return parts.join("\n\n");
}
