import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  streamText: vi.fn(),
  deepseek: vi.fn(),
}));

vi.mock("ai", () => ({ streamText: mocks.streamText }));
vi.mock("@/lib/ai/client", () => ({ deepseek: mocks.deepseek, MODELS: { chat: "deepseek-chat" } }));
vi.mock("@/lib/search/tavily", () => ({ tavilySearch: vi.fn(), formatSearchResults: vi.fn() }));

import { POST } from "./route";

const requestBudget = {
  maxMessages: 40,
  maxMessageCharacters: 8_000,
};

function request(
  cookie?: string,
  body: unknown = { messages: [{ role: "user", content: "Review this strategy" }] },
  signal?: AbortSignal,
) {
  return new Request("http://localhost:3000/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });
}

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn());
    mocks.deepseek.mockReturnValue("configured-model");
    mocks.streamText.mockReturnValue({ toTextStreamResponse: () => new Response("ok") });
  });

  it("rejects requests without a session before invoking the AI provider", async () => {
    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("rejects an invalid session before invoking the AI provider", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));

    const response = await POST(request("epsilon_session=invalid; unrelated=do-not-forward"));

    expect(response.status).toBe(401);
    expect(fetch).toHaveBeenCalledWith("http://localhost:8000/api/me", expect.objectContaining({
      headers: { cookie: "epsilon_session=invalid" },
    }));
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("fails closed when session verification is unavailable", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("backend offline"));

    const response = await POST(request("epsilon_session=valid"));

    expect(response.status).toBe(503);
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("reports an unavailable critic before invoking the provider when its server key is missing", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }));

    const response = await POST(request("epsilon_session=valid"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Research critic is not configured. Add a server-side DeepSeek API key and try again.",
    });
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("preserves the AI request contract for a verified session", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }));
    const aiRequest = request("epsilon_session=valid");

    const response = await POST(aiRequest);

    expect(response.status).toBe(200);
    expect(mocks.streamText).toHaveBeenCalledOnce();
    expect(mocks.streamText).toHaveBeenCalledWith(expect.objectContaining({
      abortSignal: aiRequest.signal,
      timeout: 45_000,
      maxOutputTokens: 1_024,
    }));
  });

  it("passes a bounded experiment artifact to the research critic prompt", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }));

    const response = await POST(request("epsilon_session=valid", {
      messages: [{ role: "user", content: "What would falsify this result?" }],
      experiment: {
        subject: "NVDA",
        hypothesis: "Momentum persists in this window.",
        test: {
          method: "backtest",
          strategy: "momentum",
          symbols: ["NVDA"],
          startDate: "2024-01-01",
          endDate: "2024-06-30",
          initialCash: 100000,
          totalReturn: 0.12,
          sharpe: 1.1,
          maxDrawdown: -0.08,
          tradeCount: 14,
          completedAt: "2026-08-10T19:00:00.000Z",
        },
      },
    }));

    expect(response.status).toBe(200);
    const requestOptions = mocks.streamText.mock.calls[0][0];
    expect(requestOptions.messages[0].content).toMatch(/quantitative research critic/i);
    expect(requestOptions.messages[0].content).toContain('"subject":"NVDA"');
    expect(requestOptions.messages[0].content).toContain('"dataMode":"unknown"');
    expect(requestOptions.messages[0].content).toContain('"dataProvider":null');
    expect(requestOptions.messages[0].content).toMatch(/hypothesis is a user claim/i);
    expect(requestOptions.messages[0].content).toMatch(/do not claim data provenance/i);
  });

  it("does not imply external evidence when web search is disabled", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }));

    const response = await POST(request("epsilon_session=valid", {
      messages: [{ role: "user", content: "Momentum definitely works." }],
      searchEnabled: false,
      experiment: { subject: "AAPL", hypothesis: "Momentum definitely works.", test: null },
    }));

    expect(response.status).toBe(200);
    const systemPrompt = mocks.streamText.mock.calls[0][0].messages[0].content;
    expect(systemPrompt).toMatch(/quantitative research critic/i);
    expect(systemPrompt).not.toMatch(/following external search results/i);
    expect(systemPrompt).toMatch(/hypothesis|No active experiment artifact/i);
  });

  it("accepts the maximum supported message count", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }));
    const messages = Array.from({ length: requestBudget.maxMessages }, () => ({ role: "user", content: "x" }));

    const response = await POST(request("epsilon_session=valid", { messages }));

    expect(response.status).toBe(200);
    expect(mocks.streamText).toHaveBeenCalledOnce();
  });

  it("rejects malformed and over-budget inputs before invoking the AI provider", async () => {
    const cases = [
      { messages: [{ role: "system", content: "not accepted" }] },
      { messages: Array.from({ length: requestBudget.maxMessages + 1 }, () => ({ role: "user", content: "x" })) },
      { messages: [{ role: "user", content: "x".repeat(requestBudget.maxMessageCharacters + 1) }] },
      { messages: Array.from({ length: 4 }, () => ({ role: "user", content: "x".repeat(6_001) })) },
    ];

    for (const body of cases) {
      vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }));
      const response = await POST(request("epsilon_session=valid", body));
      expect([400, 413]).toContain(response.status);
    }
    expect(mocks.streamText).not.toHaveBeenCalled();
  });
});
