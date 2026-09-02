export const clientImpactEvents = ["site_visit", "lab_opened", "challenge_opened", "reproduce_opened"] as const;
export const verifiedImpactEvents = ["verified_historical_run"] as const;
export const impactEvents = [...clientImpactEvents, ...verifiedImpactEvents] as const;
export type ImpactEventName = (typeof impactEvents)[number];
export type ClientImpactEventName = (typeof clientImpactEvents)[number];

export function isClientImpactEvent(value: unknown): value is ClientImpactEventName {
  return typeof value === "string" && (clientImpactEvents as readonly string[]).includes(value);
}

const sourceLabels = ["direct", "internal", "github", "stocktwits", "x", "linkedin", "reddit", "youtube", "producthunt", "substack", "email", "school", "other"] as const;

export function normalizeImpactSource(value: unknown) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "direct";
  return (sourceLabels as readonly string[]).includes(normalized) ? normalized : "other";
}
