import type { BacktestResult } from "@/lib/api";

export const EVIDENCE_FORMAT = "epsilon.evidence.v1" as const;

export type EvidenceConfiguration = {
  strategy: string;
  startDate: string;
  endDate: string;
  stockCodes: string[];
  initialCash: number;
  feeRate: number;
  minimumFee: number;
  slippagePerShare: number;
};

export type EvidenceResultSnapshot = {
  strategyName: string;
  totalReturn: number;
  cagr: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  tradeCount: number;
  equityCurve: Array<{ date: string; equity: number }>;
};

export type EvidenceObservation = {
  id: string;
  label: string;
  parameter: "fee_rate" | "minimum_fee" | "slippage_per_share" | "start_date" | "stock_codes";
  baselineValue: string;
  perturbedValue: string;
  status: "succeeded" | "failed";
  result: EvidenceResultSnapshot | null;
};

export type EvidenceArtifact = {
  format: typeof EVIDENCE_FORMAT;
  claim: string;
  falsifiedIf: string;
  configuration: EvidenceConfiguration;
  baseline: EvidenceResultSnapshot;
  observations: EvidenceObservation[];
  provenance: {
    resultOrigin: "guest-simulation" | "backtest-service-response";
    dataMode: "controlled-synthetic";
    dataSource: string;
    samplingInterval: string;
    fillModel: string;
  };
  generatedAt: string;
};

export function snapshotBacktest(result: BacktestResult): EvidenceResultSnapshot {
  return {
    strategyName: result.strategy_name,
    totalReturn: result.performance.total_return,
    cagr: result.performance.cagr,
    sharpe: result.performance.sharpe,
    maxDrawdown: result.performance.max_drawdown,
    winRate: result.performance.win_rate,
    profitFactor: result.performance.profit_factor,
    tradeCount: result.trades.length,
    equityCurve: result.equity_curve.slice(0, 240).map((point) => ({ date: point.date, equity: point.equity })),
  };
}

export function createEvidenceArtifact(input: Omit<EvidenceArtifact, "format" | "generatedAt">): EvidenceArtifact {
  return {
    ...input,
    format: EVIDENCE_FORMAT,
    generatedAt: new Date().toISOString(),
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isSafeText(value: unknown, maxLength = 500): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isSnapshot(value: unknown): value is EvidenceResultSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<EvidenceResultSnapshot>;
  return (
    isSafeText(candidate.strategyName, 80) &&
    isFiniteNumber(candidate.totalReturn) &&
    isFiniteNumber(candidate.cagr) &&
    isFiniteNumber(candidate.sharpe) &&
    isFiniteNumber(candidate.maxDrawdown) &&
    isFiniteNumber(candidate.winRate) &&
    isFiniteNumber(candidate.profitFactor) &&
    isFiniteNumber(candidate.tradeCount) &&
    Array.isArray(candidate.equityCurve) &&
    candidate.equityCurve.length <= 240 &&
    candidate.equityCurve.every((point) => (
      point && isSafeText(point.date, 32) && isFiniteNumber(point.equity)
    ))
  );
}

export function isEvidenceArtifact(value: unknown): value is EvidenceArtifact {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<EvidenceArtifact>;
  const configuration = candidate.configuration as Partial<EvidenceConfiguration> | undefined;
  const provenance = candidate.provenance as Partial<EvidenceArtifact["provenance"]> | undefined;
  return (
    candidate.format === EVIDENCE_FORMAT &&
    isSafeText(candidate.claim) &&
    isSafeText(candidate.falsifiedIf) &&
    Boolean(configuration) &&
    isSafeText(configuration?.strategy, 80) &&
    isSafeText(configuration?.startDate, 32) &&
    isSafeText(configuration?.endDate, 32) &&
    Array.isArray(configuration?.stockCodes) &&
    configuration.stockCodes.length > 0 &&
    configuration.stockCodes.length <= 20 &&
    configuration.stockCodes.every((code) => isSafeText(code, 16)) &&
    isFiniteNumber(configuration.initialCash) &&
    isFiniteNumber(configuration.feeRate) &&
    isFiniteNumber(configuration.minimumFee) &&
    isFiniteNumber(configuration.slippagePerShare) &&
    isSnapshot(candidate.baseline) &&
    Array.isArray(candidate.observations) &&
    candidate.observations.length <= 8 &&
    candidate.observations.every((observation) => (
      observation &&
      isSafeText(observation.id, 48) &&
      isSafeText(observation.label, 80) &&
      ["fee_rate", "minimum_fee", "slippage_per_share", "start_date", "stock_codes"].includes(observation.parameter) &&
      isSafeText(observation.baselineValue, 48) &&
      isSafeText(observation.perturbedValue, 48) &&
      ["succeeded", "failed"].includes(observation.status) &&
      (observation.result === null || isSnapshot(observation.result))
    )) &&
    Boolean(provenance) &&
    ["guest-simulation", "backtest-service-response"].includes(provenance?.resultOrigin ?? "") &&
    provenance?.dataMode === "controlled-synthetic" &&
    isSafeText(provenance.dataSource, 180) &&
    isSafeText(provenance.samplingInterval, 80) &&
    isSafeText(provenance.fillModel, 180) &&
    isSafeText(candidate.generatedAt, 40)
  );
}

export function encodeEvidenceArtifact(artifact: EvidenceArtifact) {
  const bytes = new TextEncoder().encode(JSON.stringify(artifact));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

export function decodeEvidenceArtifact(encoded: string): EvidenceArtifact | null {
  if (!encoded || encoded.length > 64_000) return null;
  try {
    const padded = encoded.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return isEvidenceArtifact(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function describeStability(artifact: EvidenceArtifact) {
  const completed = artifact.observations.filter((observation) => observation.status === "succeeded" && observation.result);
  const baselineDirection = Math.sign(artifact.baseline.totalReturn);
  const preserved = completed.filter((observation) => Math.sign(observation.result!.totalReturn) === baselineDirection).length;
  return {
    completed: completed.length,
    preserved,
    reversed: completed.length - preserved,
  };
}
