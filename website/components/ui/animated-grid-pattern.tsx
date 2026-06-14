"use client";

import { useEffect, useRef } from "react";

interface AnimatedGridPatternProps {
  className?: string;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
}

export function AnimatedGridPattern({
  className = "",
  numSquares = 80,
  maxOpacity = 0.08,
  duration = 4,
}: AnimatedGridPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let startTime: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };

    const draw = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = (time - startTime) / 1000;

      const w = canvas.width;
      const h = canvas.height;
      const cols = Math.ceil(w / 48);
      const rows = Math.ceil(h / 48);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgb(0 208 156)";

      const squaresToDraw = Math.min(numSquares, cols * rows);

      for (let i = 0; i < squaresToDraw; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * 48;
        const y = row * 48;

        const phase = (col * 0.1 + row * 0.13 + elapsed / duration) % 1;
        const opacity = Math.sin(phase * Math.PI) * maxOpacity;

        ctx.globalAlpha = Math.max(0, opacity);
        ctx.fillRect(x + 2, y + 2, 44, 44);
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [numSquares, maxOpacity, duration]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
