import { runBacktest, stripLedger, type BacktestConfig, type Bar, type RunConfig, type Strategy } from "../../../../lib/backtest";
import { createEvidenceArtifact, describeRule, evidenceDigest, EVIDENCE_LIMITATIONS, EPSILON_SOFTWARE_REVISION, evaluateEvidence, type FalsificationRule } from "../../../../lib/evidence-contract";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { consumeProviderBudget } from "../../../../lib/provider-budget";
import { missingProviderSymbols } from "../../../../lib/provider-cache";
import { readBoundedJson, RequestBodyError } from "../../../../lib/http";
import { recordVerifiedHistoricalRun } from "../../../../lib/impact";

export const runtime = "edge";

const SYMBOL = /^[A-Z][A-Z0-9.-]{0,9}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 86_400_000;
const COLORS = ["#f5f5f0", "#a88cff", "#ff8b5d", "#4dd9c0", "#ffc857", "#ef5da8"];
const strategies: Strategy[] = ["Buy & Hold", "Moving Average (20-day)", "Momentum (2%)"];
const metrics = ["net_return", "max_drawdown", "sharpe"];
const operators = ["gt", "gte", "lt", "lte"];
type CacheEntry = { expiresAt: number; bars: Bar[] };
const runtimeState = globalThis as typeof globalThis & { epsilonMarketCache?: Map<string, CacheEntry> };
const marketCache = runtimeState.epsilonMarketCache ?? new Map<string, CacheEntry>();
runtimeState.epsilonMarketCache = marketCache;

function response(body: unknown, status = 200, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } });
}

function isoShift(value: string, days: number) {
  return new Date(Date.parse(`${value}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of marketCache) if (entry.expiresAt <= now) marketCache.delete(key);
  while (marketCache.size > 64) marketCache.delete(marketCache.keys().next().value as string);
}

async function loadSymbol(symbol: string, from: string, to: string, apiKey: string) {
  const cacheKey = `${symbol}:${from}:${to}`;
  const url = new URL(`https://api.massive.com/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${from}/${to}`);
  url.searchParams.set("adjusted", "true");
  url.searchParams.set("sort", "asc");
  url.searchParams.set("limit", "50000");
  const upstream = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(12_000) });
  if (!upstream.ok) {
    if (upstream.status === 403) throw new Error("provider_access_window");
    if (upstream.status === 429) throw new Error("provider_rate_limit");
    throw new Error(`provider_unavailable:${symbol}`);
  }
  const payload = await upstream.json() as { results?: Array<{ t: number; c: number }> };
  const bars = (payload.results ?? []).map((bar) => ({ timestamp: bar.t, close: bar.c })).filter((bar) => Number.isFinite(bar.close) && bar.close > 0);
  if (!bars.length) throw new Error(`provider_empty:${symbol}`);
  marketCache.set(cacheKey, { expiresAt: Date.now() + 300_000, bars });
  pruneCache();
  return bars;
}

function cachedSymbol(symbol: string, from: string, to: string) {
  const cached = marketCache.get(`${symbol}:${from}:${to}`);
  return cached && cached.expiresAt > Date.now() ? cached.bars : null;
}

function validRule(value: unknown): value is FalsificationRule {
  if (!value || typeof value !== "object") return false;
  const rule = value as Record<string, unknown>;
  return metrics.includes(String(rule.metric)) && operators.includes(String(rule.operator)) && Number.isFinite(Number(rule.threshold)) && Math.abs(Number(rule.threshold)) <= 1_000 && (rule.perturbationScope === "all" || rule.perturbationScope === "any");
}

export async function POST(request: Request) {
  if (process.env.HISTORICAL_DATA_ENABLED !== "true") return response({ error: "Historical mode is not enabled for this release." }, 503);
  const apiKey = process.env.MASSIVE_API_KEY;
  if (!apiKey) return response({ error: "Historical data is not configured." }, 503);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return response({ error: "Content-Type must be application/json." }, 415);
  const limit = checkRateLimit(request, "evidence-run", 6);
  if (limit.limited) return response({ error: "Historical evidence limit reached. Try again shortly." }, 429, { "Retry-After": String(limit.retryAfter) });

  let input: Partial<BacktestConfig> & { claim?: string; falsificationRule?: unknown };
  try { input = await readBoundedJson<typeof input>(request, 20_000); }
  catch (error) {
    if (error instanceof RequestBodyError) return response({ error: error.message }, error.status);
    return response({ error: "Request body must be valid JSON." }, 400);
  }

  const claim = String(input.claim ?? "").trim();
  const universe = Array.isArray(input.universe) ? [...new Set(input.universe.map((item) => String(item).trim().toUpperCase()))] : [];
  if (!claim || claim.length > 240) return response({ error: "Claim must contain 1–240 characters." }, 400);
  if (!validRule(input.falsificationRule)) return response({ error: "Provide a valid machine-evaluable rejection rule." }, 400);
  const rule: FalsificationRule = { ...input.falsificationRule, threshold: Number(input.falsificationRule.threshold) };
  if (!input.start || !input.end || !ISO_DATE.test(input.start) || !ISO_DATE.test(input.end)) return response({ error: "Use ISO dates (YYYY-MM-DD)." }, 400);
  if (!input.strategy || !strategies.includes(input.strategy as Strategy)) return response({ error: "Unsupported strategy." }, 400);
  if (!universe.length || universe.length > 5 || universe.some((symbol) => !SYMBOL.test(symbol))) return response({ error: "Use one to five valid ticker symbols." }, 400);
  const startTime = Date.parse(`${input.start}T00:00:00Z`);
  const endTime = Date.parse(`${input.end}T00:00:00Z`);
  const rangeDays = (endTime - startTime) / DAY;
  if (rangeDays < 30 || rangeDays > 730) return response({ error: "Date range must be between 30 days and 2 years." }, 400);
  const fee = Number(input.fee);
  const slippage = Number(input.slippage);
  if (!Number.isFinite(fee) || fee < 0 || fee > 0.02 || !Number.isFinite(slippage) || slippage < 0 || slippage > 10) return response({ error: "Execution assumptions are outside supported bounds." }, 400);

  try {
    const base: BacktestConfig = { strategy: input.strategy as Strategy, start: input.start, end: input.end, universe, fee, slippage };
    const shiftedStart = isoShift(input.start, 30);
    const shiftedEnd = isoShift(input.end, 30);
    const narrow = universe.slice(0, Math.max(1, Math.ceil(universe.length / 2)));
    const runs: RunConfig[] = [
      { ...base, id: "baseline", label: "Baseline", changed: "None", color: COLORS[0] },
      { ...base, fee: fee * 5, id: "epsilon-1", label: "Fee ×5", changed: `${fee} → ${Number((fee * 5).toFixed(5))}`, color: COLORS[1] },
      { ...base, slippage: slippage * 5, id: "epsilon-2", label: "Slippage ×5", changed: `$${slippage} → $${Number((slippage * 5).toFixed(3))}`, color: COLORS[2] },
      { ...base, start: shiftedStart, end: shiftedEnd, id: "epsilon-3", label: "Window +30d", changed: `${input.start} → ${shiftedStart}`, color: COLORS[3] },
      { ...base, universe: narrow, id: "epsilon-4", label: "Narrow universe", changed: `${universe.join(",")} → ${narrow.join(",")}`, color: COLORS[4] },
      { ...base, fee: fee * 5, slippage: slippage * 5, start: shiftedStart, end: shiftedEnd, id: "epsilon-5", label: "Joint execution stress", changed: "Fee ×5 + slippage ×5 + window +30d", color: COLORS[5] },
    ];
    const fetchFrom = isoShift(input.start, -45);
    const fetchTo = shiftedEnd;
    const cached = new Map(universe.map((symbol) => [symbol, cachedSymbol(symbol, fetchFrom, fetchTo)]));
    const misses = missingProviderSymbols(universe, (symbol) => cached.get(symbol));
    if (misses.length && !(await consumeProviderBudget(misses.length))) {
      return response({ error: "The shared historical-data budget is busy. Try again after the next minute, or use the deterministic mode." }, 429, { "Retry-After": "60" });
    }
    const loaded = await Promise.all(universe.map(async (symbol) => [symbol, cached.get(symbol) ?? await loadSymbol(symbol, fetchFrom, fetchTo, apiKey)] as const));
    const series = Object.fromEntries(loaded);
    const computed = runs.map((run) => runBacktest(run, series));
    const baselineLedger = computed[0].ledger;
    const evidenceRuns = computed.map(stripLedger);
    const dataFingerprint = await evidenceDigest(Object.fromEntries(loaded.map(([symbol, bars]) => [symbol, bars.map((bar) => [bar.timestamp, bar.close])])));
    const core = {
      format: "epsilon.evidence.v2" as const,
      softwareRevision: EPSILON_SOFTWARE_REVISION,
      claim,
      falsification: describeRule(rule),
      config: { ...base, universe: universe.join(",") },
      mode: "historical-market-data" as const,
      provenance: { provider: "Massive", adjusted: true, symbols: universe, dataFingerprint, timing: "Signals use information through the prior close; positions apply to the next close-to-close return." },
      falsificationRule: rule,
      verdict: evaluateEvidence(evidenceRuns, rule),
      runs: evidenceRuns,
      baselineLedger,
      limitations: [...EVIDENCE_LIMITATIONS],
    };
    const artifact = await createEvidenceArtifact(core);
    await recordVerifiedHistoricalRun(artifact.evidenceId, artifact.artifactHash, artifact.generatedAt).catch(() => undefined);
    return response(artifact);
  } catch (error) {
    const message = error instanceof Error ? error.message : "historical_evidence_failed";
    if (message === "provider_access_window") return response({ error: "This historical window is outside the currently available data range. Choose more recent dates." }, 422);
    if (message === "provider_rate_limit") return response({ error: "Market-data provider limit reached. Try again later." }, 429, { "Retry-After": "60" });
    if (message.startsWith("provider_")) return response({ error: "Historical market data is temporarily unavailable for one or more symbols." }, 502);
    if (message.includes("observations")) return response({ error: message }, 422);
    return response({ error: "Historical evidence could not be completed." }, 500);
  }
}
