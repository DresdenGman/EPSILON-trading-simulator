// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DownloadPage from "./page";

describe("DownloadPage", () => {
  it("does not present unpublished installers as working downloads", () => {
    const { container } = render(React.createElement(DownloadPage));

    expect(screen.getByText(/Packaged installers are not currently published for v1.0.0/i)).toBeTruthy();
    expect(screen.getAllByText(/Not published/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByRole("button", { name: /installer/i })).toBeNull();
    expect(container.querySelectorAll('a[href="#"]')).toHaveLength(0);
    expect(screen.getByText(/cd EPSILON-trading-simulator/)).toBeTruthy();
  });
});
