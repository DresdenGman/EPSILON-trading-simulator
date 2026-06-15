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
    <div className="card bg-base-200 shadow-sm overflow-hidden h-full">
      <div className="card-body p-0">
        <div className="px-4 py-3.5 border-b border-base-300">
          <h3 className="card-title text-sm">Market Watch</h3>
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
            <div className="p-8 text-center text-base-content/40 text-sm">No stocks available</div>
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
