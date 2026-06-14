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
      <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
        <div className="text-[#64748B] animate-pulse">Loading positions...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] overflow-hidden">
      <div className="p-4 border-b border-[#1E293B]">
        <h3 className="text-white font-semibold">Portfolio</h3>
      </div>
      {positions.length === 0 ? (
        <div className="p-8 text-center text-[#64748B]">No positions yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#64748B] text-xs uppercase">
                <th className="text-left p-3">Symbol</th>
                <th className="text-right p-3">Shares</th>
                <th className="text-right p-3">Avg Cost</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Value</th>
                <th className="text-right p-3">P&L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.stock_code} className="border-t border-[#1E293B] hover:bg-white/[0.02]">
                  <td className="p-3 text-white font-medium">{pos.stock_code}</td>
                  <td className="p-3 text-right text-white">{pos.shares}</td>
                  <td className="p-3 text-right text-[#94A3B8]">${pos.avg_cost.toFixed(2)}</td>
                  <td className="p-3 text-right text-white">${pos.current_price.toFixed(2)}</td>
                  <td className="p-3 text-right text-white">${pos.market_value.toFixed(2)}</td>
                  <td className={`p-3 text-right font-medium ${pos.unrealized_pnl >= 0 ? "text-[#00D09C]" : "text-[#F0616D]"}`}>
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
