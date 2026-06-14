"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function RippleButton({
  className,
  variant = "primary",
  size = "md",
  glow = false,
  children,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const nextId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = nextId.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  const base =
    "relative inline-flex items-center justify-center overflow-hidden font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<string, string> = {
    primary: cn(
      "bg-[#00D09C] text-black hover:bg-[#00B386]",
      glow && "hover:shadow-glow"
    ),
    danger: cn(
      "bg-[#F0616D] text-white hover:bg-[#D44B56]",
      glow && "hover:shadow-[0_0_20px_rgb(240_97_109/0.3)]"
    ),
    ghost:
      "bg-white/[0.04] text-[#E2E8F0] hover:bg-white/[0.08] border border-white/[0.06]",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-2.5 text-sm rounded-xl",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-[ripple_0.6s_ease-out]"
          style={{
            left: r.x - 10,
            top: r.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(20);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}
