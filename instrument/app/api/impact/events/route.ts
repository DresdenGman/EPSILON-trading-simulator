import { ensureImpactSchema, impactDb, isImpactEvent } from "../../../../lib/impact";

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
  let payload: EventPayload;
  try {
    payload = await request.json() as EventPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isImpactEvent(payload.event)) return Response.json({ error: "Unsupported event" }, { status: 400 });
  const sessionId = cleanText(payload.sessionId, 64, "");
  if (!/^[a-f0-9-]{20,64}$/i.test(sessionId)) return Response.json({ error: "Invalid session" }, { status: 400 });

  const artifactHash = cleanText(payload.artifactHash, 64, "");
  const createdAt = new Date().toISOString();
  const day = createdAt.slice(0, 10);
  const uniqueUnit = artifactHash || (payload.event === "site_visit" || payload.event === "lab_opened" ? "session" : day);
  const dedupeKey = `${payload.event}:${sessionId}:${uniqueUnit}`;

  try {
    await ensureImpactSchema();
    await impactDb().prepare(`INSERT OR IGNORE INTO impact_events
      (id, dedupe_key, event_name, session_id, source, path, artifact_hash, mode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        crypto.randomUUID(),
        dedupeKey,
        payload.event,
        sessionId,
        cleanText(payload.source, 80, "direct"),
        cleanText(payload.path, 120, "/"),
        artifactHash || null,
        cleanText(payload.mode, 32, "") || null,
        createdAt,
      ).run();
    return Response.json({ recorded: true }, { status: 202 });
  } catch {
    return Response.json({ recorded: false }, { status: 503 });
  }
}
