"use client";

import React from "react";
import { PortfolioPosition } from "@/lib/api";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";

interface PortfolioTableProps {
  positions: PortfolioPosition[];
  loading?: boolean;
}

export default function PortfolioTable({ positions, loading }: PortfolioTableProps) {
  if (loading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-white font-semibold">Portfolio</h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="text-[#64748B] animate-pulse">Loading positions...</div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard highlight>
      <GlassCardHeader>
        <h3 className="text-white font-semibold text-sm tracking-wide">PORTFOLIO</h3>
        {positions.length > 0 && (
          <span className="text-[#64748B] text-xs">{positions.length} position{positions.length > 1 ? "s" : ""}</span>
        )}
      </GlassCardHeader>
      {positions.length === 0 ? (
        <GlassCardContent>
          <div className="py-8 text-center text-[#64748B] text-sm">No positions yet. Start trading!</div>
        </GlassCardContent>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#64748B] text-[11px] uppercase tracking-wider border-b border-white/[0.04]">
                <th className="text-left p-3 font-medium">Symbol</th>
                <th className="text-right p-3 font-medium">Shares</th>
                <th className="text-right p-3 font-medium">Avg Cost</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-right p-3 font-medium">Value</th>
                <th className="text-right p-3 font-medium">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr
                  key={pos.stock_code}
                  className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-3 text-white font-semibold">{pos.stock_code}</td>
                  <td className="p-3 text-right text-white font-mono tabular-nums">{pos.shares}</td>
                  <td className="p-3 text-right text-[#94A3B8] font-mono tabular-nums">
                    ${pos.avg_cost.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-white font-mono tabular-nums">
                    ${pos.current_price.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-white font-mono tabular-nums">
                    ${pos.market_value.toFixed(2)}
                  </td>
                  <td
                    className={`p-3 text-right font-mono tabular-nums font-medium ${
                      pos.unrealized_pnl >= 0 ? "text-[#00D09C]" : "text-[#F0616D]"
                    }`}
                  >
                    {pos.unrealized_pnl >= 0 ? "+" : ""}
                    {pos.unrealized_pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
