import type { ResearchTestArtifact } from "@/components/research/ResearchContext";

type LocalCriticInput = {
  question: string;
  hypothesis: string;
  falsification: string;
  test: ResearchTestArtifact | null;
};

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function nextAtomicTest(question: string) {
  const normalized = question.toLowerCase();
  if (/fee|cost|friction|commission/.test(normalized)) return "Hold the window and universe fixed; increase fee rate once more and compare the return sign and Sharpe ratio.";
  if (/slippage|fill|liquidity|execution/.test(normalized)) return "Hold fees, window, and universe fixed; widen per-share slippage and inspect whether the sign or drawdown changes.";
  if (/window|sample|regime|period|time/.test(normalized)) return "Shift the start window again without changing the strategy or rejection rule, then compare the direction and maximum drawdown.";
  if (/universe|symbol|stock|selection/.test(normalized)) return "Change only the universe membership, preserving the strategy, dates, capital, and pre-committed rejection rule.";
  return "Change the assumption with the largest observed return effect once more, while preserving every other input and the rejection rule.";
}

export function createLocalCritique({ question, hypothesis, falsification, test }: LocalCriticInput) {
  const lines = [
    "Local evidence examination",
    "",
    `Question under review: ${question}`,
    `Claim: ${hypothesis || "No hypothesis recorded."}`,
    `Rejection rule: ${falsification || "No rejection rule recorded."}`,
    "",
  ];

  if (!test) {
    lines.push(
      "Observed evidence",
      "- No current test artifact is attached. The claim cannot yet be compared with a measured result.",
      "",
      "Next atomic test",
      `- ${nextAtomicTest(question)}`,
      "",
      "Limit",
      "- This is a deterministic browser-local critique, not live AI, web research, market evidence, or financial advice.",
    );
    return lines.join("\n");
  }

  const artifact = test.perturbationEvidence;
  lines.push(
    "Observed evidence",
    `- Baseline return ${signedPercent(test.totalReturn)}; Sharpe ${test.sharpe.toFixed(3)}; maximum drawdown ${signedPercent(test.maxDrawdown)}; ${test.tradeCount} simulated trades.`,
  );

  if (artifact) {
    const completed = artifact.observations.filter((observation) => observation.status === "succeeded" && observation.result);
    const baselineDirection = Math.sign(artifact.baseline.totalReturn);
    const reversals = completed.filter((observation) => Math.sign(observation.result!.totalReturn) !== baselineDirection);
    const failed = artifact.observations.filter((observation) => observation.status === "failed" || !observation.result);
    const sensitivity = completed
      .map((observation) => ({ observation, delta: Math.abs(observation.result!.totalReturn - artifact.baseline.totalReturn) }))
      .sort((left, right) => right.delta - left.delta)[0];

    lines.push(`- ${completed.length}/${artifact.observations.length} atomic perturbations completed; ${completed.length - reversals.length}/${completed.length} preserved the baseline direction.`);
    if (reversals.length) lines.push(`- Direction reversed under: ${reversals.map((item) => `${item.label} (${signedPercent(item.result!.totalReturn)})`).join(", ")}.`);
    else if (completed.length) lines.push("- No completed perturbation reversed the baseline direction; this is local stability evidence, not proof of the claim.");
    if (sensitivity) lines.push(`- Largest observed return movement: ${sensitivity.observation.label}, a ${sensitivity.delta.toFixed(2)} percentage-point change from baseline.`);
    if (failed.length) lines.push(`- Unresolved computation failures: ${failed.map((item) => item.label).join(", ")}. Treat stability as incomplete.`);
  } else {
    lines.push("- This legacy result has no attached perturbation field, so local sensitivity cannot be assessed.");
  }

  lines.push(
    "",
    "Challenge",
    artifact?.observations.some((observation) => observation.result && Math.sign(observation.result.totalReturn) !== Math.sign(artifact.baseline.totalReturn))
      ? "- At least one nearby assumption changes the conclusion's direction. The claim is locally fragile and should be revised or narrowed before reuse."
      : "- Directional stability alone does not test selection bias, regime dependence, benchmark choice, or whether the strategy was chosen after seeing the path.",
    "",
    "Next atomic test",
    `- ${nextAtomicTest(question)}`,
    "",
    "Limits",
    `- Provenance: ${test.provenance.dataSource ?? "source not recorded"}; ${test.provenance.samplingInterval ?? "sampling interval not recorded"}.`,
    "- Controlled synthetic results are not historical performance, a forecast, or investment advice.",
    "- This examination is generated deterministically in the browser; no live model or web retrieval is used.",
  );
  return lines.join("\n");
}
