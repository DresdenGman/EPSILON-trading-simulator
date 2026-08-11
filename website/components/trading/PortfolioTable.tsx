"use client";

import React from "react";
import { PortfolioPosition } from "@/lib/api";

interface PortfolioTableProps {
  positions: PortfolioPosition[];
  loading?: boolean;
  state?: "idle" | "loading" | "ready" | "empty" | "error";
}

export default function PortfolioTable({ positions, loading, state = "ready" }: PortfolioTableProps) {
  if (loading) {
    return (
      <div className="border border-base-300 bg-base-200/70 p-5 space-y-4" aria-label="Loading position ledger">
        <div className="skeleton h-3 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-base-300/70 pt-3">
            <div className="skeleton h-4 w-14" />
            <div className="skeleton h-4 w-10" />
            <div className="skeleton h-4 w-16 ml-auto" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="overflow-hidden border border-base-300 bg-base-200/70" aria-label="Position ledger">
        <div className="flex items-center justify-between border-b border-base-300 px-4 py-3.5">
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.14em] text-primary/70">Position ledger</p>
            <h3 className="mt-1 text-sm font-semibold text-base-content">Confirmed open positions</h3>
          </div>
          <span className="font-mono text-2xs text-base-content/45">{positions.length} {positions.length === 1 ? "POSITION" : "POSITIONS"}</span>
        </div>
        {state === "error" ? (
          <div className="p-5 text-sm text-warning">
            <p className="font-mono text-2xs uppercase tracking-[0.14em]">Source unavailable</p>
            <p className="mt-2 font-medium">Portfolio unavailable</p>
            <p className="mt-1 text-xs text-base-content/45">We couldn&apos;t confirm your current positions, so no holdings are inferred here.</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="p-5 text-sm text-base-content/45">
            <p className="font-mono text-2xs uppercase tracking-[0.14em] text-primary/70">No current exposure</p>
            <p className="mt-2 text-base-content/70">No positions yet</p>
            <p className="mt-1 text-xs">Your account currently has no confirmed open positions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="bg-base-300/30">
                <tr>
                  {["Symbol", "Shares", "Avg Cost", "Price", "Value", "P&L"].map((h) => (
                    <th key={h} className={`font-mono text-2xs uppercase tracking-[0.1em] text-base-content/45 ${h === "Symbol" ? "" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.stock_code} className="hover:bg-base-300/20">
                    <td className="font-mono font-semibold text-xs text-base-content">{pos.stock_code}</td>
                    <td className="text-right font-mono text-xs">{pos.shares}</td>
                    <td className="text-right text-base-content/60 font-mono text-xs">${pos.avg_cost.toFixed(2)}</td>
                    <td className="text-right font-mono text-xs">${pos.current_price.toFixed(2)}</td>
                    <td className="text-right font-mono text-xs">${pos.market_value.toFixed(2)}</td>
                    <td className={`text-right font-mono text-xs font-semibold ${pos.unrealized_pnl >= 0 ? "text-success" : "text-error"}`}>
                      {pos.unrealized_pnl >= 0 ? "+" : ""}{pos.unrealized_pnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </section>
  );
}
