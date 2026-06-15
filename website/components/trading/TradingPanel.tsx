"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, StockPrice } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface TradingPanelProps {
  stock: StockPrice | null;
  onTradeExecuted: (side?: "buy" | "sell") => void;
}

export default function TradingPanel({ stock, onTradeExecuted }: TradingPanelProps) {
  const { isAuthenticated } = useAuth();
  const [shares, setShares] = useState(10);
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !loading && stock && isAuthenticated) {
        e.preventDefault();
        handleTrade();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loading, stock, isAuthenticated, shares, side, orderType, limitPrice, triggerPrice]);

  if (!stock) {
    return (
      <div className="card bg-base-200 shadow-sm min-h-[300px] flex items-center justify-center">
        <div className="text-center text-base-content/40">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-sm">Select a stock to trade</p>
        </div>
      </div>
    );
  }

  const currentPrice = stock.price;
  const estimatedTotal = shares * currentPrice;

  const handleTrade = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to trade");
      return;
    }
    setLoading(true);
    try {
      if (orderType === "market") {
        const fn = side === "buy" ? api.buy : api.sell;
        const result = await fn({ stock_code: stock.code, shares, price: currentPrice });
        toast.success(result.message, {
          description: `${side === "buy" ? "Bought" : "Sold"} ${shares} shares of ${stock.code} at $${currentPrice.toFixed(2)}`,
        });
        onTradeExecuted(side);
      } else {
        const price = limitPrice ? parseFloat(limitPrice) : undefined;
        const trigger = triggerPrice ? parseFloat(triggerPrice) : undefined;
        const result = await api.placeOrder({
          stock_code: stock.code, order_type: orderType, side, shares, price, trigger_price: trigger,
        });
        toast.success(result.message);
        onTradeExecuted();
      }
    } catch (e: any) {
      toast.error(e.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-sm p-5 space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-base-content">{stock.code}</h3>
          <div className={`text-xs font-medium mt-0.5 ${stock.change_percent >= 0 ? "text-success" : "text-error"}`}>
            {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-base-content font-mono">${currentPrice.toFixed(2)}</div>
          <div className="text-xs text-base-content/40 uppercase tracking-wide">Last Price</div>
        </div>
      </div>

      {/* Buy/Sell toggle */}
      <div className="flex rounded-btn overflow-hidden border border-base-300 p-0.5 bg-base-300/30">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
            side === "buy" ? "bg-success text-success-content" : "text-base-content/50 hover:text-base-content"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
            side === "sell" ? "bg-error text-error-content" : "text-base-content/50 hover:text-base-content"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div>
        <label className="text-xs text-base-content/40 uppercase tracking-wide mb-1.5 block">Order Type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="select select-bordered select-sm w-full bg-base-300/50"
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop_loss">Stop Loss</option>
          <option value="take_profit">Take Profit</option>
        </select>
      </div>

      {/* Shares */}
      <div>
        <label className="text-xs text-base-content/40 uppercase tracking-wide mb-1.5 block">Shares</label>
        <input
          type="number" min={1} value={shares}
          onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
          className="input input-bordered input-sm w-full bg-base-300/50 font-mono"
        />
      </div>

      {/* Limit / Trigger price */}
      {orderType !== "market" && (
        <div>
          <label className="text-xs text-base-content/40 uppercase tracking-wide mb-1.5 block">
            {orderType === "stop_loss" || orderType === "take_profit" ? "Trigger Price" : "Limit Price"}
          </label>
          <input
            type="number" step="0.01"
            value={orderType === "stop_loss" || orderType === "take_profit" ? triggerPrice : limitPrice}
            onChange={(e) => {
              if (orderType === "stop_loss" || orderType === "take_profit") setTriggerPrice(e.target.value);
              else setLimitPrice(e.target.value);
            }}
            placeholder={currentPrice.toFixed(2)}
            className="input input-bordered input-sm w-full bg-base-300/50 font-mono"
          />
        </div>
      )}

      {/* Estimated total */}
      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-base-300/30">
        <span className="text-xs text-base-content/40 uppercase tracking-wide">Estimated</span>
        <span className="text-base-content font-mono font-semibold">${estimatedTotal.toLocaleString()}</span>
      </div>

      {/* Execute */}
      <button
        onClick={handleTrade}
        disabled={loading || !isAuthenticated}
        className={`w-full py-3 rounded font-semibold text-sm transition-all duration-250 ${
          side === "buy"
            ? "btn-offset-buy"
            : "btn-offset-sell"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? <span className="loading loading-spinner loading-xs mr-2" /> : null}
        {loading ? "Processing" : `${side === "buy" ? "Buy" : "Sell"} ${stock.code}`}
      </button>

      {!isAuthenticated && (
        <p className="text-xs text-base-content/40 text-center">
          <a href="/auth/login" className="link link-success">Login</a> to trade
        </p>
      )}
    </div>
  );
}
