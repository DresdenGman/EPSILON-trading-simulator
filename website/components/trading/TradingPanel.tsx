"use client";

import React, { useState } from "react";
import { api, StockPrice } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";
import { RippleButton } from "@/components/ui/ripple-button";

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
      <GlassCard>
        <GlassCardContent>
          <div className="text-[#64748B] text-center py-8">Select a stock to trade</div>
        </GlassCardContent>
      </GlassCard>
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
    <GlassCard highlight scan>
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white font-bold text-sm">
            {stock.code.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-white font-semibold">{stock.code}</h3>
            <div
              className={`text-xs font-medium ${
                stock.change_percent >= 0 ? "text-[#00D09C]" : "text-[#F0616D]"
              }`}
            >
              {stock.change_percent >= 0 ? "+" : ""}
              {stock.change_percent.toFixed(2)}%
            </div>
          </div>
        </div>
        <span className="text-xl font-bold text-white font-mono tabular-nums">
          ${currentPrice.toFixed(2)}
        </span>
      </GlassCardHeader>

      <GlassCardContent className="space-y-4">
        {/* Side toggle */}
        <div className="flex rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.02]">
          <button
            onClick={() => setSide("buy")}
            className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${
              side === "buy"
                ? "bg-[#00D09C] text-black shadow-lg shadow-[#00D09C]/20"
                : "text-[#64748B] hover:text-white"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${
              side === "sell"
                ? "bg-[#F0616D] text-white shadow-lg shadow-[#F0616D]/20"
                : "text-[#64748B] hover:text-white"
            }`}
          >
            Sell
          </button>
        </div>

        {/* Order type */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-[#64748B] block mb-1.5">
            Order Type
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full bg-white/[0.03] text-white rounded-lg px-3 py-2 text-sm border border-white/[0.06] focus:border-[#00D09C] outline-none transition-colors"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop_loss">Stop Loss</option>
            <option value="take_profit">Take Profit</option>
          </select>
        </div>

        {/* Shares */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-[#64748B] block mb-1.5">
            Shares
          </label>
          <input
            type="number"
            min={1}
            value={shares}
            onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-white/[0.03] text-white rounded-lg px-3 py-2 text-sm border border-white/[0.06] focus:border-[#00D09C] outline-none transition-colors"
          />
        </div>

        {/* Limit / Trigger price */}
        {orderType !== "market" && (
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#64748B] block mb-1.5">
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
              className="w-full bg-white/[0.03] text-white rounded-lg px-3 py-2 text-sm border border-white/[0.06] focus:border-[#00D09C] outline-none transition-colors"
            />
          </div>
        )}

        {/* Estimated */}
        <div className="text-sm text-[#64748B] flex justify-between">
          <span>Estimated Total</span>
          <span className="text-white font-mono tabular-nums font-medium">
            ${estimatedTotal.toLocaleString()}
          </span>
        </div>

        {/* Execute */}
        <RippleButton
          variant={side === "buy" ? "primary" : "danger"}
          glow
          className="w-full py-3 text-sm"
          onClick={handleTrade}
          disabled={loading || !isAuthenticated}
        >
          {loading ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${stock.code}`}
        </RippleButton>

        {message && (
          <div
            className={`text-xs p-2.5 rounded-lg ${
              message.toLowerCase().includes("bought") || message.toLowerCase().includes("sold") || message.toLowerCase().includes("placed")
                ? "bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20"
                : "bg-[#F0616D]/10 text-[#F0616D] border border-[#F0616D]/20"
            }`}
          >
            {message}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
