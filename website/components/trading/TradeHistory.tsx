"use client";

import React from "react";
import { TradeRecord } from "@/lib/api";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";

interface TradeHistoryProps {
  trades: TradeRecord[];
  loading?: boolean;
}

export default function TradeHistory({ trades, loading }: TradeHistoryProps) {
  if (loading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-white font-semibold text-sm tracking-wide">TRADE HISTORY</h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="text-[#64748B] animate-pulse">Loading trade history...</div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <h3 className="text-white font-semibold text-sm tracking-wide">TRADE HISTORY</h3>
        {trades.length > 0 && (
          <span className="text-[#64748B] text-xs">{trades.length} trade{trades.length > 1 ? "s" : ""}</span>
        )}
      </GlassCardHeader>
      {trades.length === 0 ? (
        <GlassCardContent>
          <div className="py-8 text-center text-[#64748B] text-sm">No trades yet. Make your first trade!</div>
        </GlassCardContent>
      ) : (
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur-sm">
              <tr className="text-[#64748B] text-[11px] uppercase tracking-wider border-b border-white/[0.04]">
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Symbol</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-right p-3 font-medium">Shares</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-right p-3 font-medium">Fee</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-3 text-[#94A3B8]">{trade.trade_date}</td>
                  <td className="p-3 text-white font-semibold">{trade.stock_code}</td>
                  <td
                    className={`p-3 font-semibold text-xs ${
                      trade.trade_type === "buy" ? "text-[#00D09C]" : "text-[#F0616D]"
                    }`}
                  >
                    {trade.trade_type.toUpperCase()}
                  </td>
                  <td className="p-3 text-right text-white font-mono tabular-nums">{trade.shares}</td>
                  <td className="p-3 text-right text-[#94A3B8] font-mono tabular-nums">
                    ${trade.price.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-white font-mono tabular-nums">
                    ${trade.total_amount.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-[#64748B] font-mono tabular-nums">
                    ${trade.fee.toFixed(2)}
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
