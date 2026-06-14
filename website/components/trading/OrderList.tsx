"use client";

import React from "react";
import { Order } from "@/lib/api";
import { api } from "@/lib/api";

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
  onUpdate: () => void;
}

export default function OrderList({ orders, loading, onUpdate }: OrderListProps) {
  const handleCancel = async (id: number) => {
    try {
      await api.cancelOrder(id);
      onUpdate();
    } catch (e: any) {
      console.error(e);
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
        <h3 className="text-text-primary text-sm font-semibold">Pending Orders</h3>
        <span className="text-2xs text-muted">{pendingOrders.length} active</span>
      </div>
      {pendingOrders.length === 0 ? (
        <div className="p-8 text-center text-muted text-sm">
          <div className="text-2xl mb-2">📝</div>
          No pending orders
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-2xs uppercase tracking-wide">
                {["ID", "Symbol", "Type", "Side", "Shares", "Price", ""].map((h) => (
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
                    ${((order.price || order.trigger_price) || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="text-danger hover:text-danger-light text-2xs font-semibold uppercase tracking-wide transition-colors px-2 py-1 rounded hover:bg-danger/10"
                    >
                      Cancel
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
