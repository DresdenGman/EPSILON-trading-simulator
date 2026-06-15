"use client";

import React, { useRef, useEffect } from "react";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  color?: string;
  staticMode?: boolean;
}

export default function Particles({
  className = "",
  quantity = 40,
  color = "100, 255, 218",
  staticMode = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const circles: {
      x: number; y: number; tx: number; ty: number;
      size: number; alpha: number; vx: number; vy: number;
    }[] = [];

    for (let i = 0; i < quantity; i++) {
      circles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        tx: 0, ty: 0,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    let mx = w / 2;
    let my = h / 2;
    let animationId: number;

    const onMouseMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    if (!staticMode) window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      circles.forEach((c) => {
        if (!staticMode) {
          c.tx += (mx - c.x) / 100;
          c.ty += (my - c.y) / 100;
          c.x += c.tx * 0.02 + c.vx;
          c.y += c.ty * 0.02 + c.vy;
        } else {
          c.x += c.vx;
          c.y += c.vy;
        }

        // Wrap around edges
        if (c.x < -10) c.x = w + 10;
        if (c.x > w + 10) c.x = -10;
        if (c.y < -10) c.y = h + 10;
        if (c.y > h + 10) c.y = -10;

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(${color}, ${c.alpha})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (!staticMode) window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, [quantity, color, staticMode]);

  return <canvas ref={canvasRef} className={`absolute inset-0 -z-10 ${className}`} />;
}
