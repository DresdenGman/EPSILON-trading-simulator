"use client";

import React from "react";
import { Order } from "@/lib/api";
import { api } from "@/lib/api";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";

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
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-white font-semibold text-sm tracking-wide">PENDING ORDERS</h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="text-[#64748B] animate-pulse">Loading orders...</div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <GlassCard>
      <GlassCardHeader>
        <h3 className="text-white font-semibold text-sm tracking-wide">PENDING ORDERS</h3>
        {pendingOrders.length > 0 && (
          <span className="text-[#64748B] text-xs">{pendingOrders.length} active</span>
        )}
      </GlassCardHeader>
      {pendingOrders.length === 0 ? (
        <GlassCardContent>
          <div className="py-8 text-center text-[#64748B] text-sm">No pending orders</div>
        </GlassCardContent>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#64748B] text-[11px] uppercase tracking-wider border-b border-white/[0.04]">
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Symbol</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Side</th>
                <th className="text-right p-3 font-medium">Shares</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-right p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/[0.02]">
                  <td className="p-3 text-[#64748B] font-mono text-xs">#{order.id}</td>
                  <td className="p-3 text-white font-semibold">{order.stock_code}</td>
                  <td className="p-3 text-[#94A3B8] capitalize text-xs">
                    {order.order_type.replace("_", " ")}
                  </td>
                  <td
                    className={`p-3 font-semibold text-xs ${
                      order.side === "buy" ? "text-[#00D09C]" : "text-[#F0616D]"
                    }`}
                  >
                    {order.side.toUpperCase()}
                  </td>
                  <td className="p-3 text-right text-white font-mono tabular-nums">{order.shares}</td>
                  <td className="p-3 text-right text-[#94A3B8] font-mono tabular-nums">
                    ${((order.price || order.trigger_price) || 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="text-[#F0616D] hover:text-white text-xs font-medium transition-colors px-2 py-1 rounded hover:bg-[#F0616D]/10"
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
    </GlassCard>
  );
}
