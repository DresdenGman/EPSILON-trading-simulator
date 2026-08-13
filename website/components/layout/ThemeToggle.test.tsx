// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => window.localStorage.clear());

  it("exposes the action without relying on the emoji", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: "Switch to light mode" });

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeTruthy();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
