import { z } from "zod";
import { getHistoricalSeries, historicalProviderStatus } from "@/lib/server/market-data";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  symbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9.-]{1,16}$/),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const windows = new Map<string, { count: number; resetAt: number }>();

function consumeBudget(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || "unknown";
  const now = Date.now();
  if (windows.size > 5_000) {
    windows.forEach((window, storedKey) => {
      if (window.resetAt <= now) windows.delete(storedKey);
    });
  }
  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + 60_000 });
    return null;
  }
  if (existing.count >= 4) return Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  existing.count += 1;
  return null;
}

function errorResponse(error: string, status: number, retryAfter?: number) {
  const headers: Record<string, string> = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (retryAfter) headers["Retry-After"] = String(retryAfter);
  return Response.json({ error }, { status, headers });
}

export async function GET(request: Request) {
  const provider = historicalProviderStatus();
  if (!provider.provider || !provider.publicEnabled) return errorResponse("Historical market data is not enabled for the public instrument.", 503);

  const retryAfter = consumeBudget(request);
  if (retryAfter) return errorResponse("Historical data request limit reached. Try again shortly.", 429, retryAfter);

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ symbol: url.searchParams.get("symbol"), start: url.searchParams.get("start"), end: url.searchParams.get("end") });
  if (!parsed.success) return errorResponse("Use a valid symbol and ISO start/end dates.", 400);
  const startDate = new Date(`${parsed.data.start}T00:00:00Z`);
  const endDate = new Date(`${parsed.data.end}T00:00:00Z`);
  if (!Number.isFinite(startDate.valueOf()) || !Number.isFinite(endDate.valueOf()) || startDate >= endDate) return errorResponse("End date must be after start date.", 400);
  if (endDate.valueOf() - startDate.valueOf() > 2 * 366 * 24 * 60 * 60 * 1000) return errorResponse("Public historical requests are limited to two years.", 400);

  try {
    const series = await getHistoricalSeries(parsed.data.symbol, parsed.data.start, parsed.data.end);
    return Response.json(series, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Historical data request failed.";
    return errorResponse(message.slice(0, 200), 502);
  }
}
