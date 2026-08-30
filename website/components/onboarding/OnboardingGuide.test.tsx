// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import OnboardingGuide from "./OnboardingGuide";

describe("OnboardingGuide", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => cleanup());

  it("orients a first-time visitor and remembers dismissal", async () => {
    const { unmount } = render(<OnboardingGuide />);
    expect(await screen.findByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(window.localStorage.getItem("epsilon.onboarding-complete.v1")).toBe("true");
    unmount();

    render(<OnboardingGuide />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("can be reopened explicitly for returning visitors", async () => {
    window.localStorage.setItem("epsilon.onboarding-complete.v1", "true");
    render(<OnboardingGuide forceOpenSignal={1} />);
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });
});
