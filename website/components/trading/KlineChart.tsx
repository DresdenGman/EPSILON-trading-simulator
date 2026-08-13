"use client";

import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

interface KlineChartProps {
  data: {
    code?: string;
    name?: string;
    dates: string[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  } | null;
  loading?: boolean;
  state?: "idle" | "loading" | "ready" | "empty" | "error";
}

export default function KlineChart({ data, loading, state = data?.dates.length ? "ready" : "empty" }: KlineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.dates.length === 0) return;

    const container = chartRef.current;
    const chart = createChart(container, {
      layout: {
        background: { color: "#0B0D14" },
        textColor: "#8B95A8",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(255,255,255,0.08)",
          style: 2,
          labelBackgroundColor: "#19202E",
        },
        horzLine: {
          color: "rgba(255,255,255,0.08)",
          style: 2,
          labelBackgroundColor: "#19202E",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: Math.max(280, container.clientHeight || 300),
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#64FFDA",
      downColor: "#F0616D",
      borderUpColor: "#64FFDA",
      borderDownColor: "#F0616D",
      wickUpColor: "#64FFDA",
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
      if (container.clientWidth > 0) {
        chart.applyOptions({ width: container.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  if (loading) {
    return (
      <div className="surface-card w-full h-full flex items-center justify-center min-h-[280px]">
        <div className="skeleton h-full w-full rounded-lg" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="surface-card w-full h-full flex items-center justify-center min-h-[280px]">
        <div className="text-center text-warning">
          <div className="text-3xl mb-3">⚠</div>
          <p className="text-sm">Price history could not be loaded.</p>
          <p className="mt-1 text-xs text-base-content/40">No fallback data is shown.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="surface-card w-full h-full flex items-center justify-center min-h-[280px]">
        <div className="text-center text-base-content/40">
          <div className="text-3xl mb-3">📈</div>
          <p className="text-sm">Select a stock to view chart</p>
        </div>
      </div>
    );
  }

  if (state === "empty" || data.dates.length === 0) {
    return (
      <div className="surface-card w-full h-full flex items-center justify-center min-h-[280px]">
        <div className="text-center text-base-content/40">
          <div className="text-3xl mb-3">📉</div>
          <p className="text-sm">No price history is available for this symbol.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-[280px] w-full flex-col overflow-hidden rounded-xl border border-base-300/90 bg-[#0B0D14] shadow-[0_12px_32px_rgba(0,0,0,0.08)]" aria-label={`${data.code ?? "Selected instrument"} price evidence`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/[0.06] px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-mono text-sm font-semibold text-base-content">{data.code ?? "MARKET"}</h3>
            <span className="truncate text-xs text-base-content/45">{data.name ?? "Price evidence"}</span>
          </div>
          <p className="mt-1 font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35">
            {data.dates[0]} → {data.dates[data.dates.length - 1]}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.12em]">
          <span className="rounded border border-white/[0.08] px-2 py-1 text-base-content/45">90D</span>
          <span className="rounded border border-primary/20 bg-primary/[0.04] px-2 py-1 text-primary/75">Synthetic daily</span>
        </div>
      </div>
      <div ref={chartRef} className="min-h-[240px] flex-1" />
    </section>
  );
}
