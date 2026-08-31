import { ensureImpactSchema, impactDb } from "../../../../lib/impact";

type MetricRow = { event_name: string; events: number; sessions: number };

export async function GET() {
  try {
    await ensureImpactSchema();
    const result = await impactDb().prepare(`SELECT event_name,
      COUNT(*) AS events,
      COUNT(DISTINCT session_id) AS sessions
      FROM impact_events GROUP BY event_name`).all<MetricRow>();
    const rows = (result.results ?? []) as MetricRow[];
    const metrics = Object.fromEntries(rows.map((row) => [row.event_name, { events: Number(row.events), sessions: Number(row.sessions) }]));
    return Response.json({ status: "live", updatedAt: new Date().toISOString(), metrics }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return Response.json({ status: "initializing", updatedAt: new Date().toISOString(), metrics: {} }, { status: 200 });
  }
}
