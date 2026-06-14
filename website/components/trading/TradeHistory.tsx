"use client";

import React from "react";
import { TradeRecord } from "@/lib/api";

interface TradeHistoryProps {
  trades: TradeRecord[];
  loading?: boolean;
}

export default function TradeHistory({ trades, loading }: TradeHistoryProps) {
  if (loading) {
    return (
      <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
        <div className="text-[#64748B] animate-pulse">Loading trade history...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] overflow-hidden">
      <div className="p-4 border-b border-[#1E293B]">
        <h3 className="text-white font-semibold">Trade History</h3>
      </div>
      {trades.length === 0 ? (
        <div className="p-8 text-center text-[#64748B]">No trades yet</div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0F172A]">
              <tr className="text-[#64748B] text-xs uppercase">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Symbol</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Shares</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Total</th>
                <th className="text-right p-3">Fee</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-t border-[#1E293B] hover:bg-white/[0.02]">
                  <td className="p-3 text-[#94A3B8]">{trade.trade_date}</td>
                  <td className="p-3 text-white font-medium">{trade.stock_code}</td>
                  <td className={`p-3 font-medium ${trade.trade_type === "buy" ? "text-[#00D09C]" : "text-[#F0616D]"}`}>
                    {trade.trade_type.toUpperCase()}
                  </td>
                  <td className="p-3 text-right text-white">{trade.shares}</td>
                  <td className="p-3 text-right text-[#94A3B8]">${trade.price.toFixed(2)}</td>
                  <td className="p-3 text-right text-white">${trade.total_amount.toFixed(2)}</td>
                  <td className="p-3 text-right text-[#64748B]">${trade.fee.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
