// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DownloadPage from "./page";

describe("DownloadPage", () => {
  it("presents one public product with an accurate source runbook", () => {
    const { container } = render(React.createElement(DownloadPage));

    expect(screen.getByText(/EPSILON has one public product/i)).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Open Decision Lab/i })[0].getAttribute("href")).toBe("/dashboard");
    expect(screen.getByRole("link", { name: /View release record/i }).getAttribute("href")).toContain("/v2.0.0");
    expect(screen.queryByText(/python mock\.py/i)).toBeNull();
    expect(container.querySelectorAll('a[href="#"]')).toHaveLength(0);
    expect(screen.getByText(/backend\.main:app/)).toBeTruthy();
    expect(screen.getByText(/NEXT_PUBLIC_API_URL=http:\/\/127\.0\.0\.1:8000 npm run dev/)).toBeTruthy();
  });
});
