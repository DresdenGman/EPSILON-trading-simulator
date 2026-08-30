// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DemoProgress from "./DemoProgress";

describe("DemoProgress", () => {
  afterEach(cleanup);

  it("matches the visible experiment section order", () => {
    render(<DemoProgress activeStep={3} />);

    const labels = screen.getAllByRole("link").map((link) => link.textContent?.replace(/\s+/g, " ").trim());
    expect(labels).toEqual([
      "01Question",
      "02Primary",
      "03Diagnosis",
      "04Conclusion",
      "05Replication",
      "06Limits",
    ]);
  });
});
