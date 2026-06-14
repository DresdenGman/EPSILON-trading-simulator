"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
  formatter?: "currency" | "percent" | "number";
}

export function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  className = "",
  duration = 800,
  formatter = "number",
}: NumberTickerProps) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setDisplay(start + diff * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    prevValue.current = value;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value, duration]);

  const formatted = (() => {
    switch (formatter) {
      case "currency":
        return `$${display.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}`;
      case "percent":
        return `${display >= 0 ? "+" : ""}${display.toFixed(decimals)}%`;
      default:
        return display.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    }
  })();

  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
