export interface ExperimentDiagnosisInput {
  baselineReturn: number;
  perturbedReturn: number;
  baselineTrades: number;
  perturbedTrades: number;
  parameter: "slippage_per_share";
  baselineParameter: number;
  perturbedParameter: number;
}

export interface ExperimentDiagnosis {
  outcome: "preserved" | "reversed" | "inconclusive";
  baselineSign: "positive" | "non_positive";
  perturbedSign: "positive" | "non_positive";
  deltaReturnPp: number;
  effect: "weakened" | "strengthened" | "unchanged";
  valid: boolean;
  parameter: "slippage_per_share";
  baselineParameter: number;
  perturbedParameter: number;
}

export type ReplicationVerdict = "replicated" | "not_replicated" | "inconclusive";

export function evaluateReplication(primary: ExperimentDiagnosis, replication: ExperimentDiagnosis): ReplicationVerdict {
  if (!primary.valid || !replication.valid) return "inconclusive";
  return primary.baselineSign === replication.baselineSign
    && primary.perturbedSign === replication.perturbedSign
    && primary.outcome === replication.outcome
    ? "replicated"
    : "not_replicated";
}

export function diagnoseExperiment(input: ExperimentDiagnosisInput): ExperimentDiagnosis {
  const baselineSign = input.baselineReturn > 0 ? "positive" : "non_positive";
  const perturbedSign = input.perturbedReturn > 0 ? "positive" : "non_positive";
  const deltaReturnPp = input.perturbedReturn - input.baselineReturn;
  const effect = deltaReturnPp < 0 ? "weakened" : deltaReturnPp > 0 ? "strengthened" : "unchanged";
  const valid = input.baselineTrades > 0 && input.perturbedTrades > 0;

  return {
    outcome: !valid ? "inconclusive" : baselineSign === perturbedSign ? "preserved" : "reversed",
    baselineSign,
    perturbedSign,
    deltaReturnPp,
    effect,
    valid,
    parameter: input.parameter,
    baselineParameter: input.baselineParameter,
    perturbedParameter: input.perturbedParameter,
  };
}
