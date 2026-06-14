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
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] overflow-hidden">
      <div className="p-4 border-b border-[#1E293B]">
        <h3 className="text-white font-semibold">Market Watch</h3>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-[#64748B] animate-pulse">Loading...</div>
        ) : stocks.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">No stocks available</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0F172A]">
              <tr className="text-[#64748B] text-xs uppercase">
                <th className="text-left p-3">Symbol</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Change</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.code}
                  onClick={() => onSelect(stock.code)}
                  className={`border-t border-[#1E293B] cursor-pointer transition-colors ${
                    selectedCode === stock.code
                      ? "bg-[#00D09C]/10 border-l-2 border-l-[#00D09C]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="p-3">
                    <div className="text-white font-medium">{stock.code}</div>
                    <div className="text-[#64748B] text-xs">{stock.name}</div>
                  </td>
                  <td className="p-3 text-right text-white font-medium">${stock.price.toFixed(2)}</td>
                  <td className={`p-3 text-right font-medium ${stock.change_percent >= 0 ? "text-[#00D09C]" : "text-[#F0616D]"}`}>
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
