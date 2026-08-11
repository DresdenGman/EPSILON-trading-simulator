"use client";

import React, { useState } from "react";
import { Order } from "@/lib/api";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
  state?: "idle" | "loading" | "ready" | "empty" | "error";
  onUpdate: () => Promise<boolean>;
}

export default function OrderList({ orders, loading, state = "ready", onUpdate }: OrderListProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleCancel = async (id: number) => {
    if (cancellingId !== null) return;
    setCancellingId(id);
    try {
      await api.cancelOrder(id);
      const reconciled = await onUpdate();
      if (reconciled) toast.success(`Order #${id} cancelled and order state reconciled.`);
      else toast.warning("Order cancelled, but account data may be stale.");
    } catch (e: any) {
      toast.error(e.message || "Order cancellation failed");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="surface-card p-6 space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-4 w-8" />
            <div className="skeleton h-4 w-14" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-10" />
            <div className="skeleton h-4 w-14 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <div className="surface-card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-text-primary text-sm font-semibold">Pending Orders</h3>
          <p className="mt-1 text-2xs text-muted">Recorded instructions. Automatic conditional execution is not enabled.</p>
        </div>
        <span className="text-2xs text-muted">{pendingOrders.length} active</span>
      </div>
      {state === "error" ? (
        <div className="p-8 text-center text-warning text-sm">
          <div className="text-2xl mb-2">⚠</div>
          <p className="font-medium">Orders unavailable</p>
          <p className="mt-1 text-xs text-base-content/45">We couldn&apos;t confirm your pending orders.</p>
        </div>
      ) : pendingOrders.length === 0 ? (
        <div className="p-8 text-center text-muted text-sm">
          <div className="text-2xl mb-2">📝</div>
          <p>No pending orders</p>
          <p className="mt-1 text-xs text-muted">There are currently no orders waiting to execute.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-2xs uppercase tracking-wide">
                {["ID", "Symbol", "Type", "Side", "Shares", "Target", ""].map((h) => (
                  <th key={h} className={h === "ID" || h === "Symbol" || h === "Type" || h === "Side" ? "text-left font-medium px-4 py-2" : "text-right font-medium px-4 py-2"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id} className="border-t border-white/[0.03]">
                  <td className="px-4 py-2.5 text-muted text-xs font-mono">#{order.id}</td>
                  <td className="px-4 py-2.5 text-text-primary font-semibold text-xs">{order.stock_code}</td>
                  <td className="px-4 py-2.5 text-secondary text-xs capitalize">{order.order_type.replace("_", " ")}</td>
                  <td className={`px-4 py-2.5 text-xs font-semibold ${order.side === "buy" ? "text-accent" : "text-danger"}`}>
                    {order.side.toUpperCase()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-text-primary font-mono text-xs">{order.shares}</td>
                  <td className="px-4 py-2.5 text-right text-secondary font-mono text-xs">
                    {order.price != null || order.trigger_price != null
                      ? `$${(order.price ?? order.trigger_price ?? 0).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId !== null}
                      className="text-danger hover:text-danger-light text-2xs font-semibold uppercase tracking-wide transition-colors px-2 py-1 rounded hover:bg-danger/10"
                    >
                      {cancellingId === order.id ? "Cancelling…" : "Cancel"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
