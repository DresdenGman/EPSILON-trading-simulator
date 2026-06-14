"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  highlight?: boolean;
  scan?: boolean;
}

export function GlassCard({
  className,
  glow = false,
  highlight = false,
  scan = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl transition-all duration-300",
        glow && "hover:shadow-glow",
        highlight && "border-glow",
        scan && "scan-line",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-5 pt-5 pb-3 border-b border-white/[0.04] flex items-center justify-between",
        className
      )}
      {...props}
    />
  );
}

export function GlassCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 pt-3", className)} {...props} />;
}
