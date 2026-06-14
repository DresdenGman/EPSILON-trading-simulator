"use client";

import React, { useState } from "react";
import { api, StockPrice } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface TradingPanelProps {
  stock: StockPrice | null;
  onTradeExecuted: () => void;
}

export default function TradingPanel({ stock, onTradeExecuted }: TradingPanelProps) {
  const { isAuthenticated } = useAuth();
  const [shares, setShares] = useState(10);
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!stock) {
    return (
      <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
        <div className="text-[#64748B] text-center">Select a stock to trade</div>
      </div>
    );
  }

  const currentPrice = stock.price;
  const estimatedTotal = shares * currentPrice;

  const handleTrade = async () => {
    if (!isAuthenticated) {
      setMessage("Please login to trade");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      if (orderType === "market") {
        const fn = side === "buy" ? api.buy : api.sell;
        const result = await fn({ stock_code: stock.code, shares, price: currentPrice });
        setMessage(result.message);
        onTradeExecuted();
      } else {
        const price = limitPrice ? parseFloat(limitPrice) : undefined;
        const trigger = triggerPrice ? parseFloat(triggerPrice) : undefined;
        const result = await api.placeOrder({
          stock_code: stock.code,
          order_type: orderType,
          side,
          shares,
          price,
          trigger_price: trigger,
        });
        setMessage(result.message);
        onTradeExecuted();
      }
    } catch (e: any) {
      setMessage(e.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg">{stock.code}</h3>
        <span className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</span>
      </div>

      <div className={`text-sm font-medium ${stock.change_percent >= 0 ? "text-[#00D09C]" : "text-[#F0616D]"}`}>
        {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
      </div>

      {/* Side toggle */}
      <div className="flex rounded-lg overflow-hidden border border-[#1E293B]">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            side === "buy" ? "bg-[#00D09C] text-black" : "bg-transparent text-[#64748B] hover:text-white"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            side === "sell" ? "bg-[#F0616D] text-white" : "bg-transparent text-[#64748B] hover:text-white"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div>
        <label className="text-xs text-[#64748B] block mb-1">Order Type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="w-full bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop_loss">Stop Loss</option>
          <option value="take_profit">Take Profit</option>
        </select>
      </div>

      {/* Shares */}
      <div>
        <label className="text-xs text-[#64748B] block mb-1">Shares</label>
        <input
          type="number"
          min={1}
          value={shares}
          onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
        />
      </div>

      {/* Limit price */}
      {orderType !== "market" && (
        <div>
          <label className="text-xs text-[#64748B] block mb-1">
            {orderType === "stop_loss" || orderType === "take_profit" ? "Trigger Price" : "Limit Price"}
          </label>
          <input
            type="number"
            step="0.01"
            value={orderType === "stop_loss" || orderType === "take_profit" ? triggerPrice : limitPrice}
            onChange={(e) => {
              if (orderType === "stop_loss" || orderType === "take_profit") {
                setTriggerPrice(e.target.value);
              } else {
                setLimitPrice(e.target.value);
              }
            }}
            placeholder={currentPrice.toFixed(2)}
            className="w-full bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
          />
        </div>
      )}

      {/* Estimated total */}
      <div className="text-sm text-[#64748B]">
        Estimated: <span className="text-white font-medium">${estimatedTotal.toLocaleString()}</span>
      </div>

      {/* Execute */}
      <button
        onClick={handleTrade}
        disabled={loading || !isAuthenticated}
        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
          side === "buy"
            ? "bg-[#00D09C] hover:bg-[#00B386] text-black"
            : "bg-[#F0616D] hover:bg-[#D9444F] text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${stock.code}`}
      </button>

      {message && (
        <div className={`text-xs p-2 rounded-lg ${message.includes("Success") ? "bg-[#00D09C]/10 text-[#00D09C]" : "bg-[#F0616D]/10 text-[#F0616D]"}`}>
          {message}
        </div>
      )}
    </div>
  );
}
