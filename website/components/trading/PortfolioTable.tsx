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
      <div className="card bg-base-200 shadow-sm p-6 space-y-3">
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
    <div className="card bg-base-200 shadow-sm overflow-hidden">
      <div className="card-body p-0">
        <div className="px-4 py-3.5 border-b border-base-300 flex items-center justify-between">
          <h3 className="card-title text-sm">Portfolio</h3>
          <span className="badge badge-ghost badge-sm">{positions.length}</span>
        </div>
        {positions.length === 0 ? (
          <div className="p-8 text-center text-base-content/40 text-sm">
            <div className="text-2xl mb-2">💼</div>
            No positions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  {["Symbol", "Shares", "Avg Cost", "Price", "Value", "P&L"].map((h) => (
                    <th key={h} className={h === "Symbol" ? "" : "text-right"}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.stock_code} className="hover">
                    <td className="font-semibold text-xs">{pos.stock_code}</td>
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
      </div>
    </div>
  );
}
