import { ensureImpactSchema, impactDb } from "../../../../lib/impact";

type MetricRow = { event_name: string; events: number; sessions: number };
type SourceRow = { source: string; sessions: number; lab_sessions: number };

export async function GET() {
  try {
    await ensureImpactSchema();
    const [metricResult, sourceResult] = await impactDb().batch([
      impactDb().prepare(`SELECT event_name,
        COUNT(*) AS events,
        COUNT(DISTINCT session_id) AS sessions
        FROM impact_events GROUP BY event_name`),
      impactDb().prepare(`SELECT source,
        COUNT(DISTINCT session_id) AS sessions,
        COUNT(DISTINCT CASE WHEN event_name = 'lab_opened' THEN session_id END) AS lab_sessions
        FROM impact_events
        WHERE event_name IN ('site_visit', 'lab_opened')
        GROUP BY source ORDER BY lab_sessions DESC, sessions DESC LIMIT 20`),
    ]);
    const rows = (metricResult.results ?? []) as unknown as MetricRow[];
    const sourceRows = (sourceResult.results ?? []) as unknown as SourceRow[];
    const metrics = Object.fromEntries(rows.map((row) => [row.event_name, { events: Number(row.events), sessions: Number(row.sessions) }]));
    const sources = sourceRows.map((row) => ({ source: row.source, sessions: Number(row.sessions), labSessions: Number(row.lab_sessions) }));
    return Response.json({ status: "live", updatedAt: new Date().toISOString(), metrics, sources }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return Response.json({ status: "initializing", updatedAt: new Date().toISOString(), metrics: {}, sources: [] }, { status: 200 });
  }
}
