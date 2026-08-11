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
    <div className="card bg-base-200 shadow-sm overflow-hidden h-full border border-base-300">
      <div className="card-body p-0">
        <div className="flex items-start justify-between gap-3 border-b border-base-300 px-4 py-3.5">
          <div>
            <p className="product-kicker">01 / Observe</p>
            <h3 className="mt-1 text-sm font-semibold text-base-content">Market universe</h3>
          </div>
          {selectedCode && <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-2xs text-primary">{selectedCode}</span>}
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
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Chg%</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr
                    key={stock.code}
                    onClick={() => onSelect(stock.code)}
                    className={`cursor-pointer transition-colors ${
                      selectedCode === stock.code ? "bg-primary/10 border-l-2 border-l-primary" : "hover"
                    }`}
                  >
                    <td>
                      <div className="font-semibold text-xs">{stock.code}</div>
                      <div className="text-xs text-base-content/40 truncate max-w-[80px]">{stock.name}</div>
                    </td>
                    <td className="text-right font-mono text-xs">${stock.price.toFixed(2)}</td>
                    <td className={`text-right font-mono text-xs font-medium ${stock.change_percent >= 0 ? "text-success" : "text-error"}`}>
                      {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
