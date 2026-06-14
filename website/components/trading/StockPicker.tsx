"use client";

import React from "react";
import { StockPrice } from "@/lib/api";

interface StockPickerProps {
  stocks: StockPrice[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  loading?: boolean;
}

export default function StockPicker({ stocks, selectedCode, onSelect, loading }: StockPickerProps) {
  return (
    <div className="surface-card overflow-hidden h-full">
      <div className="px-4 py-3.5 border-b border-white/5">
        <h3 className="text-text-primary text-sm font-semibold">Market Watch</h3>
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
        ) : stocks.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">No stocks available</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-raised z-10">
              <tr className="text-muted text-2xs uppercase tracking-wide">
                <th className="text-left font-medium px-4 py-2">Symbol</th>
                <th className="text-right font-medium px-4 py-2">Price</th>
                <th className="text-right font-medium px-4 py-2">Chg%</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.code}
                  onClick={() => onSelect(stock.code)}
                  className={`border-t border-white/[0.03] cursor-pointer transition-all duration-150 ${
                    selectedCode === stock.code
                      ? "bg-accent/10 border-l-2 border-l-accent"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="text-text-primary font-medium text-xs">{stock.code}</div>
                    <div className="text-muted text-2xs truncate max-w-[80px]">{stock.name}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-text-primary font-mono font-medium text-xs">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-mono text-xs font-medium ${
                    stock.change_percent >= 0 ? "text-accent" : "text-danger"
                  }`}>
                    {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
