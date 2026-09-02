import { consumeImpactBudget, impactDb, isClientImpactEvent, normalizeImpactSource } from "../../../../lib/impact";
import { readBoundedJson, RequestBodyError } from "../../../../lib/http";
import { checkRateLimit } from "../../../../lib/rate-limit";

type EventPayload = {
  event?: unknown;
  sessionId?: unknown;
  source?: unknown;
  path?: unknown;
  artifactHash?: unknown;
  mode?: unknown;
};

function cleanText(value: unknown, max: number, fallback = "unknown") {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return Response.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  const limit = checkRateLimit(request, "impact-events", 12);
  if (limit.limited) return Response.json({ error: "Measurement limit reached." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  let payload: EventPayload;
  try {
    payload = await readBoundedJson<EventPayload>(request, 2_048);
  } catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isClientImpactEvent(payload.event)) return Response.json({ error: "Unsupported client event" }, { status: 400 });
  const sessionId = cleanText(payload.sessionId, 64, "");
  if (!/^[a-f0-9-]{20,64}$/i.test(sessionId)) return Response.json({ error: "Invalid session" }, { status: 400 });

  const artifactHash = "";
  const createdAt = new Date().toISOString();
  const day = createdAt.slice(0, 10);
  const uniqueUnit = artifactHash || (payload.event === "site_visit" || payload.event === "lab_opened" ? "session" : day);
  const dedupeKey = `${payload.event}:${sessionId}:${uniqueUnit}`;

  try {
    if (!(await consumeImpactBudget())) return Response.json({ error: "Measurement is busy." }, { status: 429, headers: { "Retry-After": "60" } });
    await impactDb().prepare(`INSERT OR IGNORE INTO impact_events
      (id, dedupe_key, event_name, session_id, source, path, artifact_hash, mode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        crypto.randomUUID(),
        dedupeKey,
        payload.event,
        sessionId,
        normalizeImpactSource(payload.source),
        cleanText(payload.path, 120, "/").startsWith("/") ? cleanText(payload.path, 120, "/") : "/",
        artifactHash || null,
        null,
        createdAt,
      ).run();
    return Response.json({ recorded: true }, { status: 202 });
  } catch {
    return Response.json({ recorded: false }, { status: 503 });
  }
}
