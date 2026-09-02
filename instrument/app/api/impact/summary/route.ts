import { impactDb, pruneImpactEvents } from "../../../../lib/impact";

type MetricRow = { event_name: string; events: number; sessions: number };
export async function GET() {
  try {
    const retainedAfter = await pruneImpactEvents();
    const metricResult = await impactDb().prepare(`SELECT event_name,
        COUNT(*) AS events,
        COUNT(DISTINCT session_id) AS sessions
        FROM impact_events
        WHERE event_name IN ('site_visit', 'lab_opened', 'challenge_opened', 'reproduce_opened', 'verified_historical_run')
          AND created_at >= ?
        GROUP BY event_name`).bind(retainedAfter).all();
    const rows = (metricResult.results ?? []) as unknown as MetricRow[];
    const metrics = Object.fromEntries(rows.map((row) => [row.event_name, { events: Number(row.events), sessions: Number(row.sessions) }]));
    return Response.json({ status: "live", updatedAt: new Date().toISOString(), metrics, measurement: { verified: ["verified_historical_run"], unverifiedSignals: ["site_visit", "lab_opened", "challenge_opened", "reproduce_opened"], retentionDays: 90, countingWindow: "rolling" } }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return Response.json({ status: "initializing", updatedAt: new Date().toISOString(), metrics: {}, measurement: { verified: [], unverifiedSignals: [], retentionDays: 90 } }, { status: 200 });
  }
}
