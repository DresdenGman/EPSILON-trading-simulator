"use client";

import React from "react";
import { StockPrice } from "@/lib/api";

interface StockPickerProps {
  stocks: StockPrice[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  loading?: boolean;
  state?: "idle" | "loading" | "ready" | "empty" | "error";
}

export default function StockPicker({ stocks, selectedCode, onSelect, loading, state = stocks.length > 0 ? "ready" : "empty" }: StockPickerProps) {
  return (
    <div className="card h-full overflow-hidden border border-base-300/90 bg-base-200/65 shadow-[0_14px_36px_rgba(0,0,0,0.1)]">
      <div className="card-body p-0">
        <div className="flex items-start justify-between gap-3 border-b border-base-300 px-4 py-3.5">
          <div>
            <p className="product-kicker">Instrument selection</p>
            <h3 className="mt-1 text-sm font-semibold text-base-content">Market universe</h3>
          </div>
          <span className="font-mono text-2xs uppercase tracking-[0.1em] text-base-content/35">{stocks.length} instruments</span>
        </div>
        <div className="overflow-y-auto max-h-[360px]">
          {loading ? (
            <div className="space-y-1 p-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <div className="skeleton h-4 w-12" />
                  <div className="skeleton h-3 w-20 ml-auto" />
                  <div className="skeleton h-3 w-14" />
                </div>
              ))}
            </div>
          ) : state === "error" ? (
            <div className="p-8 text-center text-sm text-warning">
              <p>Market prices are unavailable.</p>
              <p className="mt-1 text-xs text-base-content/40">No fallback prices are shown.</p>
            </div>
          ) : stocks.length === 0 ? (
            <div className="p-8 text-center text-base-content/40 text-sm">No market prices are available yet.</div>
          ) : (
            <div role="listbox" aria-label="Market universe">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-base-300 px-4 py-2 font-mono text-2xs uppercase tracking-[0.1em] text-base-content/45" aria-hidden="true">
                <span>Symbol</span><span className="text-right">Price</span><span className="text-right">Chg%</span>
              </div>
              {stocks.map((stock) => (
                <button
                  key={stock.code}
                  type="button"
                  role="option"
                  aria-selected={selectedCode === stock.code}
                  aria-label={`Select ${stock.code}, ${stock.name}, price $${stock.price.toFixed(2)}, change ${stock.change_percent >= 0 ? "plus" : "minus"} ${Math.abs(stock.change_percent).toFixed(2)} percent`}
                  onClick={() => onSelect(stock.code)}
                  className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-base-300/60 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-base-300/40 focus-visible:relative focus-visible:z-10 ${
                    selectedCode === stock.code ? "border-l-2 border-l-primary bg-primary/10" : "border-l-2 border-l-transparent"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      {stock.code}
                      {selectedCode === stock.code && <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />}
                    </span>
                    <span className="block max-w-[90px] truncate text-2xs text-base-content/40">{stock.name}</span>
                  </span>
                  <span className="text-right font-mono text-xs">${stock.price.toFixed(2)}</span>
                  <span className={`text-right font-mono text-xs font-medium ${stock.change_percent >= 0 ? "text-success" : "text-error"}`}>
                    {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
