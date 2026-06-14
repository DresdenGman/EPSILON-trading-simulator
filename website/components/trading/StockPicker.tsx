"use client";

import React from "react";
import { StockPrice } from "@/lib/api";
import { GlassCard, GlassCardHeader } from "@/components/ui/glass-card";

interface StockPickerProps {
  stocks: StockPrice[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  loading?: boolean;
}

export default function StockPicker({ stocks, selectedCode, onSelect, loading }: StockPickerProps) {
  return (
    <GlassCard className="h-full">
      <GlassCardHeader>
        <h3 className="text-white font-semibold text-sm tracking-wide">MARKET WATCH</h3>
        {stocks.length > 0 && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C] pulse-glow" />
        )}
      </GlassCardHeader>
      <div className="overflow-y-auto max-h-[350px]">
        {loading ? (
          <div className="p-8 text-center text-[#64748B] animate-pulse">Loading...</div>
        ) : stocks.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-sm">No stocks available</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur-sm">
              <tr className="text-[#64748B] text-[11px] uppercase tracking-wider border-b border-white/[0.04]">
                <th className="text-left p-3 font-medium">Symbol</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-right p-3 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.code}
                  onClick={() => onSelect(stock.code)}
                  className={`border-b border-white/[0.02] cursor-pointer transition-all duration-150 ${
                    selectedCode === stock.code
                      ? "bg-[#00D09C]/10 border-l-2 border-l-[#00D09C]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <td className="p-3">
                    <div className="text-white font-semibold text-xs">{stock.code}</div>
                    <div className="text-[#64748B] text-[11px] truncate max-w-[80px]">{stock.name}</div>
                  </td>
                  <td className="p-3 text-right text-white font-mono tabular-nums text-xs">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td
                    className={`p-3 text-right font-mono tabular-nums text-xs font-medium ${
                      stock.change_percent >= 0 ? "text-[#00D09C]" : "text-[#F0616D]"
                    }`}
                  >
                    {stock.change_percent >= 0 ? "+" : ""}
                    {stock.change_percent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </GlassCard>
  );
}
