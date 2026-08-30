export type ResearchTestState = "empty" | "stale" | "current";

export type ResearchNextStep = {
  index: "01" | "02" | "03" | "04";
  stage: "Frame" | "Test" | "Interrogate";
  title: string;
  description: string;
  action: string;
  href: string;
};

type ResearchWorkflowInput = {
  hypothesis: string;
  falsification: string;
  testState: ResearchTestState;
  symbol?: string | null;
};

export function getResearchNextStep({ hypothesis, falsification, testState, symbol }: ResearchWorkflowInput): ResearchNextStep {
  if (!hypothesis.trim()) {
    return {
      index: "01",
      stage: "Frame",
      title: "Write one claim you can test.",
      description: "Turn the selected market observation into a specific, falsifiable hypothesis.",
      action: "Frame the hypothesis",
      href: "#research-hypothesis",
    };
  }

  if (!falsification.trim()) {
    return {
      index: "02",
      stage: "Frame",
      title: "Decide what would change your mind.",
      description: "Commit to a rejection rule before seeing the result.",
      action: "Set the rejection rule",
      href: "#research-falsification",
    };
  }

  if (testState !== "current") {
    const query = symbol ? `?symbols=${encodeURIComponent(symbol)}` : "";
    return {
      index: "03",
      stage: "Test",
      title: testState === "stale" ? "Retest the revised claim." : "Run the controlled experiment.",
      description: testState === "stale"
        ? "The saved evidence belongs to an earlier version of this experiment."
        : "Carry the claim and rejection rule into Strategy Lab.",
      action: testState === "stale" ? "Retest in Strategy Lab" : "Continue to Strategy Lab",
      href: `/dashboard/backtest${query}`,
    };
  }

  return {
    index: "04",
    stage: "Interrogate",
    title: "Challenge the current evidence.",
    description: "Look for fragile assumptions, missing provenance, and reasons to revise the conclusion.",
    action: "Interrogate the evidence",
    href: "/dashboard/ai",
  };
}
