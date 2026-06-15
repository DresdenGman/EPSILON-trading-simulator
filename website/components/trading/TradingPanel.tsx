"use client";

import React, { useState, useEffect } from "react";
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
  const [message, setMessage] = useState("");

  // Keyboard shortcut: Enter to execute trade
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
      <div className="surface-card p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center text-muted">
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
        onTradeExecuted(side);
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
    <div className="surface-card p-5 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-text-primary font-bold text-lg">{stock.code}</h3>
          <div className={`text-xs font-medium mt-0.5 ${stock.change_percent >= 0 ? "text-accent" : "text-danger"}`}>
            {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-text-primary font-mono">${currentPrice.toFixed(2)}</div>
          <div className="text-2xs text-muted uppercase tracking-wide">Last Price</div>
        </div>
      </div>

      {/* Side toggle */}
      <div className="flex rounded-lg overflow-hidden border border-white/10 p-0.5 bg-white/[0.02]">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-250 ${
            side === "buy"
              ? "bg-accent text-black shadow-glow-accent-sm"
              : "text-secondary hover:text-text-primary"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-250 ${
            side === "sell"
              ? "bg-danger text-white"
              : "text-secondary hover:text-text-primary"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div>
        <label className="text-2xs text-muted uppercase tracking-wide mb-1.5 block">Order Type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="w-full bg-white/[0.03] text-text-primary rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-accent/30 focus:ring-1 focus:ring-accent/10 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop_loss">Stop Loss</option>
          <option value="take_profit">Take Profit</option>
        </select>
      </div>

      {/* Shares */}
      <div>
        <label className="text-2xs text-muted uppercase tracking-wide mb-1.5 block">Shares</label>
        <input
          type="number"
          min={1}
          value={shares}
          onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full bg-white/[0.03] text-text-primary rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-accent/30 focus:ring-1 focus:ring-accent/10 outline-none transition-all font-mono"
        />
      </div>

      {/* Limit / Trigger price */}
      {orderType !== "market" && (
        <div>
          <label className="text-2xs text-muted uppercase tracking-wide mb-1.5 block">
            {orderType === "stop_loss" || orderType === "take_profit" ? "Trigger Price" : "Limit Price"}
          </label>
          <input
            type="number"
            step="0.01"
            value={orderType === "stop_loss" || orderType === "take_profit" ? triggerPrice : limitPrice}
            onChange={(e) => {
              if (orderType === "stop_loss" || orderType === "take_profit") setTriggerPrice(e.target.value);
              else setLimitPrice(e.target.value);
            }}
            placeholder={currentPrice.toFixed(2)}
            className="w-full bg-white/[0.03] text-text-primary rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-accent/30 focus:ring-1 focus:ring-accent/10 outline-none transition-all font-mono"
          />
        </div>
      )}

      {/* Estimated total */}
      <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/[0.02]">
        <span className="text-2xs text-muted uppercase tracking-wide">Estimated</span>
        <span className="text-text-primary font-mono font-semibold">${estimatedTotal.toLocaleString()}</span>
      </div>

      {/* Execute button */}
      <button
        onClick={handleTrade}
        disabled={loading || !isAuthenticated}
        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-250 ${
          side === "buy"
            ? "bg-accent hover:bg-accent-light text-black shadow-glow-accent-sm hover:shadow-glow-accent"
            : "bg-danger hover:bg-danger-light text-white"
        } disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Processing
          </span>
        ) : (
          `${side === "buy" ? "Buy" : "Sell"} ${stock.code}`
        )}
      </button>

      {message && (
        <div className={`text-xs p-3 rounded-lg font-medium ${
          message.includes("Success") || message.includes("Bought") || message.includes("Sold")
            ? "bg-accent/10 text-accent border border-accent/20"
            : "bg-danger/10 text-danger border border-danger/20"
        }`}>
          {message}
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-2xs text-muted text-center">
          <a href="/auth/login" className="text-accent hover:underline">Login</a> to trade
        </p>
      )}
    </div>
  );
}
