// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import StockPicker from "./StockPicker";

describe("StockPicker", () => {
  afterEach(cleanup);

  it("exposes each market instrument as a keyboard-operable option", () => {
    const onSelect = vi.fn();
    render(<StockPicker stocks={[{ code: "AAPL", name: "Apple", price: 201.25, change_percent: 0.75 }]} selectedCode={null} onSelect={onSelect} />);

    const option = screen.getByRole("option", { name: /Select AAPL/i });
    option.focus();
    fireEvent.keyDown(option, { key: "Enter" });
    fireEvent.click(option);

    expect(document.activeElement).toBe(option);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(option.getAttribute("aria-selected")).toBe("false");
  });
});
