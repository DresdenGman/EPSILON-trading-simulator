"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api, StockPrice } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import MotionCard from "@/components/effects/MotionCard";

interface TradingPanelProps {
  stock: StockPrice | null;
  onTradeExecuted: (side?: "buy" | "sell") => Promise<"reconciled" | "stale">;
}

export default function TradingPanel({ stock, onTradeExecuted }: TradingPanelProps) {
  const { isAuthenticated, isGuest } = useAuth();
  const [shares, setShares] = useState(10);
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const currentPrice = stock?.price ?? 0;
  const estimatedTotal = shares * currentPrice;
  const isConditionalOrder = orderType !== "market";
  const requiresTrigger = orderType === "stop_loss" || orderType === "take_profit";
  const targetLabel = requiresTrigger ? "Trigger Price" : "Limit Price";
  const orderTypeLabel = orderType.replace("_", " ");

  const handleTrade = useCallback(async () => {
    if (!stock || loading) return;
    if (!isAuthenticated) {
      toast.error("Please login to trade");
      return;
    }
    setLoading(true);
    try {
      if (orderType === "market") {
        const fn = side === "buy" ? api.buy : api.sell;
        const result = await fn({ stock_code: stock.code, shares });
        const reconciliation = await onTradeExecuted(side);
        toast.success(result.message, {
          description: reconciliation === "reconciled"
            ? "Execution price confirmed and account state reconciled."
            : "Trade accepted by the server, but displayed account data may be stale.",
        });
      } else {
        const targetValue = requiresTrigger ? triggerPrice : limitPrice;
        const targetPrice = Number(targetValue);
        if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
          toast.error(`${targetLabel} is required for a ${orderTypeLabel} order.`);
          return;
        }
        const result = await api.placeOrder({
          stock_code: stock.code,
          order_type: orderType,
          side,
          shares,
          price: requiresTrigger ? undefined : targetPrice,
          trigger_price: requiresTrigger ? targetPrice : undefined,
        });
        const reconciliation = await onTradeExecuted();
        toast.success(result.message, {
          description: reconciliation === "reconciled"
            ? "Recorded as pending. Automatic conditional execution is not enabled in this simulator."
            : "Order recorded, but displayed account data may be stale.",
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, limitPrice, loading, onTradeExecuted, orderType, orderTypeLabel, requiresTrigger, shares, side, stock, targetLabel, triggerPrice]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !loading) {
        e.preventDefault();
        void handleTrade();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleTrade, loading]);

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

  return (
    <MotionCard className="card bg-base-200 shadow-sm h-full border border-base-300" glowColor="100,255,218">
      <div className="p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="product-kicker">Decision / execution</p>
          <h3 className="mt-1 font-mono text-lg font-semibold text-base-content">{stock.code}</h3>
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
        <label className="text-2xs text-base-content/40 uppercase tracking-wide mb-0.5 block">Order Type</label>
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
        <label className="text-2xs text-base-content/40 uppercase tracking-wide mb-0.5 block">Shares</label>
        <input
          type="number" min={1} value={shares}
          onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
          className="input input-bordered input-sm w-full bg-base-300/50 font-mono"
        />
      </div>

      {/* Limit / Trigger price */}
      {isConditionalOrder && (
        <div>
          <label className="text-xs text-base-content/40 uppercase tracking-wide mb-1.5 block">
            {targetLabel}
          </label>
          <input
            type="number" min="0.01" step="0.01" required
            value={requiresTrigger ? triggerPrice : limitPrice}
            onChange={(e) => {
              if (requiresTrigger) setTriggerPrice(e.target.value);
              else setLimitPrice(e.target.value);
            }}
            placeholder={currentPrice.toFixed(2)}
            className="input input-bordered input-sm w-full bg-base-300/50 font-mono"
          />
          <p className="mt-1 text-2xs text-base-content/40">
            This order is recorded as pending and can be cancelled. It does not auto-execute in the current simulator.
          </p>
        </div>
      )}

      {/* Estimated total */}
      <div className="flex justify-between items-center py-1.5 px-2.5 rounded bg-base-300/30">
        <span className="text-2xs text-base-content/40 uppercase tracking-wide">Estimated</span>
        <span className="text-base-content font-mono font-semibold text-xs">${estimatedTotal.toLocaleString()}</span>
      </div>

      {/* Execute */}
      <button
        onClick={handleTrade}
        disabled={loading || !isAuthenticated}
        className={`w-full py-2.5 rounded font-semibold text-xs transition-all duration-250 ${
          side === "buy"
            ? "btn-offset-buy"
            : "btn-offset-sell"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? <span className="loading loading-spinner loading-xs mr-2" /> : null}
        {loading
          ? "Processing"
          : isConditionalOrder
            ? `Place ${side === "buy" ? "Buy" : "Sell"} ${orderTypeLabel} order`
            : `${side === "buy" ? "Buy" : "Sell"} ${stock.code}`}
      </button>

      {!isAuthenticated && (
        <p className="text-center text-xs text-base-content/40">Trading session unavailable.</p>
      )}
      {isGuest && (
        <p className="text-center font-mono text-2xs uppercase tracking-[0.1em] text-base-content/35">
          Guest simulation · stored in this tab only
        </p>
      )}
      </div>
    </MotionCard>
  );
}
