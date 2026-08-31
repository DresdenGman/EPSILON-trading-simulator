export const runtime = "edge";

const DAY = 86_400_000;

function suggestedHistoricalRange(now = Date.now()) {
  return {
    start: new Date(now - 365 * DAY).toISOString().slice(0, 10),
    end: new Date(now - 180 * DAY).toISOString().slice(0, 10),
  };
}

export async function GET() {
  return Response.json(
    {
      status: "operational",
      instrument: "epsilon.evidence.v2",
      publicMode: process.env.HISTORICAL_DATA_ENABLED === "true" && Boolean(process.env.MASSIVE_API_KEY) ? "historical-evaluation" : "deterministic-demonstration",
      historicalAdapter: {
        configured: Boolean(process.env.MASSIVE_API_KEY),
        enabled: process.env.HISTORICAL_DATA_ENABLED === "true",
        suggestedRange: suggestedHistoricalRange(),
      },
      rawMarketDataApi: false,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
