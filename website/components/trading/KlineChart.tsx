"use client";

import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

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

  const chartBg = "surface-card";

  if (loading) {
    return (
      <div className="surface-card w-full h-full flex items-center justify-center min-h-[280px]">
        <div className="skeleton h-full w-full rounded-lg" />
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

  return (
    <div ref={chartRef} className="w-full h-full rounded-xl overflow-hidden border border-base-300 shadow-sm min-h-[280px]" />
  );
}
