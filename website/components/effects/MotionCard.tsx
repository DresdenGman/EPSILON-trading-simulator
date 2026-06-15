"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function MotionCard({ children, className = "", glowColor = "100,255,218" }: MotionCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useSpring(0, { stiffness: 300, damping: 80 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 80 });

  function onMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const { left, top } = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(200px at ${mouseX}px ${mouseY}px, rgba(${glowColor},0.15), transparent)`;

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={`relative overflow-hidden transition-all duration-500 ${className}`}
    >
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: maskImage }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
