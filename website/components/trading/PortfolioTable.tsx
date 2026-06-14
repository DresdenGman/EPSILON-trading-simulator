"use client";

import React from "react";
import { PortfolioPosition } from "@/lib/api";

interface PortfolioTableProps {
  positions: PortfolioPosition[];
  loading?: boolean;
}

export default function PortfolioTable({ positions, loading }: PortfolioTableProps) {
  if (loading) {
    return (
      <div className="surface-card p-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
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
    <div className="surface-card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-text-primary text-sm font-semibold">Portfolio</h3>
        <span className="text-2xs text-muted">{positions.length} position{positions.length !== 1 ? "s" : ""}</span>
      </div>
      {positions.length === 0 ? (
        <div className="p-8 text-center text-muted text-sm">
          <div className="text-2xl mb-2">💼</div>
          No positions yet. Start trading to build your portfolio.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-2xs uppercase tracking-wide">
                {["Symbol", "Shares", "Avg Cost", "Price", "Value", "P&L"].map((h) => (
                  <th key={h} className={h === "Symbol" ? "text-left font-medium px-4 py-2" : "text-right font-medium px-4 py-2"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.stock_code} className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 text-text-primary font-semibold text-xs">{pos.stock_code}</td>
                  <td className="px-4 py-2.5 text-right text-text-primary font-mono text-xs">{pos.shares}</td>
                  <td className="px-4 py-2.5 text-right text-secondary font-mono text-xs">${pos.avg_cost.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-text-primary font-mono text-xs">${pos.current_price.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-text-primary font-mono text-xs">${pos.market_value.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right font-mono text-xs font-semibold ${pos.unrealized_pnl >= 0 ? "text-accent" : "text-danger"}`}>
                    {pos.unrealized_pnl >= 0 ? "+" : ""}{pos.unrealized_pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
