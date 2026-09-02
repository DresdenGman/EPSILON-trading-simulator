export type Metric = "net_return" | "max_drawdown" | "sharpe";
export type Operator = "gt" | "gte" | "lt" | "lte";
export type PerturbationScope = "any" | "all";

export const EPSILON_SOFTWARE_REVISION = "epsilon-instrument-2026.08.30";
export const EVIDENCE_LIMITATIONS = [
  "Adjusted daily close-to-close bars do not model intraday liquidity, market impact, taxes, borrow constraints, or partial fills.",
  "The artifact checksum detects content changes but is not a digital signature or proof of EPSILON origin.",
  "Independent reproduction requires equivalent source data and the documented software revision.",
] as const;

export type FalsificationRule = {
  metric: Metric;
  operator: Operator;
  threshold: number;
  perturbationScope: PerturbationScope;
};

export type EvidenceRun = {
  id: string;
  label: string;
  changed: string;
  returnPct: number;
  sharpe: number;
  drawdown: number;
  annualizedVol: number;
  observations: number;
  turnover: number;
  costPct: number;
  color: string;
  path: number[];
};

export type EvidenceVerdict = {
  survivalCount: number;
  testedCount: number;
  worstCase: number;
  worstMargin: number;
  largestSensitivity: { runId: string; label: string; delta: number } | null;
  nearestFailure: { runId: string; label: string; value: number } | null;
  verdict: "survives" | "fragile" | "rejected";
};

export function passesRule(value: number, rule: FalsificationRule) {
  if (rule.operator === "gt") return value > rule.threshold;
  if (rule.operator === "gte") return value >= rule.threshold;
  if (rule.operator === "lt") return value < rule.threshold;
  return value <= rule.threshold;
}

export function metricValue(run: Pick<EvidenceRun, "returnPct" | "drawdown" | "sharpe">, metric: Metric) {
  if (metric === "max_drawdown") return run.drawdown;
  if (metric === "sharpe") return run.sharpe;
  return run.returnPct;
}

function margin(value: number, rule: FalsificationRule) {
  return rule.operator === "gt" || rule.operator === "gte"
    ? value - rule.threshold
    : rule.threshold - value;
}

export function evaluateEvidence(runs: EvidenceRun[], rule: FalsificationRule): EvidenceVerdict {
  if (runs.length < 2) throw new Error("Evidence requires one baseline and at least one perturbation.");
  const baseline = runs[0];
  const tested = runs.slice(1);
  const values = runs.map((run) => metricValue(run, rule.metric));
  const testedValues = tested.map((run) => ({ run, value: metricValue(run, rule.metric) }));
  const passed = testedValues.filter(({ value }) => passesRule(value, rule));
  const failures = testedValues
    .filter(({ value }) => !passesRule(value, rule))
    .sort((a, b) => Math.abs(margin(a.value, rule)) - Math.abs(margin(b.value, rule)));
  const sensitivities = tested
    .map((run) => ({
      runId: run.id,
      label: run.label,
      delta: Number((metricValue(run, rule.metric) - metricValue(baseline, rule.metric)).toFixed(3)),
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const survivalCount = passed.length;
  const scopePassed = rule.perturbationScope === "all" ? survivalCount === tested.length : survivalCount > 0;

  return {
    survivalCount,
    testedCount: tested.length,
    worstCase: rule.operator === "gt" || rule.operator === "gte" ? Math.min(...values) : Math.max(...values),
    worstMargin: Number(Math.min(...testedValues.map(({ value }) => margin(value, rule))).toFixed(3)),
    largestSensitivity: sensitivities[0] ?? null,
    nearestFailure: failures[0]
      ? { runId: failures[0].run.id, label: failures[0].run.label, value: failures[0].value }
      : null,
    verdict: scopePassed ? "survives" : survivalCount > 0 ? "fragile" : "rejected",
  };
}

export function describeRule(rule: FalsificationRule) {
  const metric = rule.metric === "net_return" ? "net total return" : rule.metric === "max_drawdown" ? "maximum drawdown" : "annualized Sharpe";
  const operator = { gt: ">", gte: "≥", lt: "<", lte: "≤" }[rule.operator];
  const suffix = rule.metric === "sharpe" ? "" : "%";
  return `Reject the claim unless ${metric} ${operator} ${rule.threshold}${suffix} for ${rule.perturbationScope === "all" ? "every required perturbation" : "at least one perturbation"}.`;
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}

export function stableStringify(value: unknown) {
  return JSON.stringify(canonical(value));
}

export async function evidenceDigest(value: unknown) {
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createEvidenceArtifact<T extends object>(core: T, generatedAt = new Date().toISOString()) {
  const evidenceId = await evidenceDigest(core);
  const covered = {
    ...core,
    evidenceId,
    generatedAt,
    integrity: {
      algorithm: "SHA-256" as const,
      scope: "canonical artifact fields excluding artifactHash" as const,
      authenticity: "checksum only; not a digital signature" as const,
    },
  };
  return { ...covered, artifactHash: await evidenceDigest(covered) };
}

export async function verifyEvidenceArtifact(artifact: Record<string, unknown>) {
  const { artifactHash, ...covered } = artifact;
  return typeof artifactHash === "string" && artifactHash === await evidenceDigest(covered);
}
