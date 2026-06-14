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
      <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
        <div className="text-[#64748B] animate-pulse">Loading orders...</div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] overflow-hidden">
      <div className="p-4 border-b border-[#1E293B]">
        <h3 className="text-white font-semibold">Pending Orders</h3>
      </div>
      {pendingOrders.length === 0 ? (
        <div className="p-8 text-center text-[#64748B]">No pending orders</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#64748B] text-xs uppercase">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Symbol</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Side</th>
                <th className="text-right p-3">Shares</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id} className="border-t border-[#1E293B]">
                  <td className="p-3 text-[#64748B]">#{order.id}</td>
                  <td className="p-3 text-white font-medium">{order.stock_code}</td>
                  <td className="p-3 text-[#94A3B8] capitalize">{order.order_type.replace("_", " ")}</td>
                  <td className={`p-3 font-medium ${order.side === "buy" ? "text-[#00D09C]" : "text-[#F0616D]"}`}>
                    {order.side.toUpperCase()}
                  </td>
                  <td className="p-3 text-right text-white">{order.shares}</td>
                  <td className="p-3 text-right text-[#94A3B8]">
                    ${((order.price || order.trigger_price) || 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="text-[#F0616D] hover:text-[#D9444F] text-xs font-medium transition-colors"
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
