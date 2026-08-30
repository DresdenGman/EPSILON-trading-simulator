"use client";

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { api, StockPrice } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="lab-panel h-full">
      <div className="space-y-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="product-kicker">Decision / execution</p>
          <h3 className="mt-1 font-mono text-lg font-semibold text-base-content">{stock.code}</h3>
          <div className={`mt-0.5 font-mono text-2xs uppercase tracking-[0.12em] ${stock.change_percent >= 0 ? "text-success" : "text-error"}`}>
            {stock.change_percent >= 0 ? "+" : ""}{stock.change_percent.toFixed(2)}%
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold tracking-tight text-base-content">${currentPrice.toFixed(2)}</div>
          <div className="font-mono text-2xs uppercase tracking-[0.12em] text-base-content/40">Last price</div>
        </div>
      </div>

      {/* Buy/Sell toggle */}
      <div className="flex overflow-hidden rounded-lg border border-base-300 p-1 bg-base-100/40">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
            side === "buy" ? "bg-primary/15 text-primary" : "text-base-content/50 hover:text-base-content"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
            side === "sell" ? "bg-error/15 text-error" : "text-base-content/50 hover:text-base-content"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div>
        <label htmlFor="trade-order-type" className="lab-field-label">Order type</label>
        <select
          id="trade-order-type"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="lab-input"
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop_loss">Stop Loss</option>
          <option value="take_profit">Take Profit</option>
        </select>
      </div>

      {/* Shares */}
      <div>
        <label htmlFor="trade-shares" className="lab-field-label">Shares</label>
        <input
          id="trade-shares"
          type="number" min={1} value={shares}
          onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
          className="lab-input font-mono"
        />
      </div>

      {/* Limit / Trigger price */}
      {isConditionalOrder && (
        <div>
          <label htmlFor="trade-trigger-price" className="lab-field-label">
            {targetLabel}
          </label>
          <input
            id="trade-trigger-price"
            type="number" min="0.01" step="0.01" required
            value={requiresTrigger ? triggerPrice : limitPrice}
            onChange={(e) => {
              if (requiresTrigger) setTriggerPrice(e.target.value);
              else setLimitPrice(e.target.value);
            }}
            placeholder={currentPrice.toFixed(2)}
            className="lab-input font-mono"
          />
          <p className="mt-2 text-2xs leading-4 text-base-content/40">
            This order is recorded as pending and can be cancelled. It does not auto-execute in the current simulator.
          </p>
        </div>
      )}

      {/* Estimated total */}
      <div className="flex items-center justify-between rounded-lg border border-base-300/60 bg-base-100/35 px-3 py-2">
        <span className="font-mono text-2xs uppercase tracking-[0.12em] text-base-content/40">Estimated</span>
        <span className="text-base-content font-mono font-semibold text-xs">${estimatedTotal.toLocaleString()}</span>
      </div>

      {/* Execute */}
      <button
        type="button"
        onClick={handleTrade}
        disabled={loading || !isAuthenticated}
        className={`w-full rounded-md border py-2.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          side === "buy"
            ? "border-primary bg-primary text-primary-content hover:bg-primary/90"
            : "border-error/70 bg-error/10 text-error hover:bg-error/15"
        } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
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
          Browser-local simulation · stored on this device
        </p>
      )}
      </div>
    </div>
  );
}
