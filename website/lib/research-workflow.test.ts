import { describe, expect, it } from "vitest";
import { getResearchNextStep } from "@/lib/research-workflow";

describe("getResearchNextStep", () => {
  it("starts by asking for one falsifiable claim", () => {
    expect(getResearchNextStep({ hypothesis: "", falsification: "", testState: "empty", symbol: "AAPL" }))
      .toEqual(expect.objectContaining({ index: "01", action: "Frame the hypothesis", href: "#research-hypothesis" }));
  });

  it("requires a rejection rule before suggesting a test", () => {
    expect(getResearchNextStep({ hypothesis: "Momentum persists", falsification: "", testState: "empty", symbol: "AAPL" }))
      .toEqual(expect.objectContaining({ index: "02", action: "Set the rejection rule", href: "#research-falsification" }));
  });

  it("carries a fully framed experiment into Strategy Lab", () => {
    expect(getResearchNextStep({ hypothesis: "Momentum persists", falsification: "Return reverses", testState: "empty", symbol: "AAPL" }))
      .toEqual(expect.objectContaining({ index: "03", href: "/dashboard/backtest?symbols=AAPL" }));
  });

  it("moves current evidence to interrogation", () => {
    expect(getResearchNextStep({ hypothesis: "Momentum persists", falsification: "Return reverses", testState: "current", symbol: "AAPL" }))
      .toEqual(expect.objectContaining({ index: "04", href: "/dashboard/ai" }));
  });
});
