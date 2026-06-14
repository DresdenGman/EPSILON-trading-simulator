"use client";

import React, { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";

interface KlineChartProps {
  data: {
    dates: string[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  } | null;
  loading?: boolean;
}

export default function KlineChart({ data, loading }: KlineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.dates.length === 0) return;

    const container = chartRef.current;
    const chart = createChart(container, {
      layout: {
        background: { color: "#0A0F1A" },
        textColor: "#8892A4",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
      },
      width: container.clientWidth,
      height: 400,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00D09C",
      downColor: "#F0616D",
      borderUpColor: "#00D09C",
      borderDownColor: "#F0616D",
      wickUpColor: "#00D09C",
      wickDownColor: "#F0616D",
    });

    const candleData = data.dates.map((date, i) => ({
      time: date,
      open: data.open[i],
      high: data.high[i],
      low: data.low[i],
      close: data.close[i],
    }));

    candleSeries.setData(candleData);
    chart.timeScale().fitContent();

    chartInstance.current = chart;

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-[#0A0F1A] rounded-xl border border-[#1E293B] flex items-center justify-center">
        <div className="text-[#64748B] animate-pulse">Loading chart...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-[400px] bg-[#0A0F1A] rounded-xl border border-[#1E293B] flex items-center justify-center">
        <div className="text-[#64748B]">Select a stock to view chart</div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className="w-full rounded-xl overflow-hidden border border-[#1E293B]" />
  );
}
