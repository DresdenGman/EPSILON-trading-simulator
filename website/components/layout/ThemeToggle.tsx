"use client";

import React, { useEffect, useState } from "react";

const ICONS = { dark: "🌙", light: "☀️" };

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("epsilon-theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("epsilon-theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="btn btn-ghost btn-sm text-lg"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {ICONS[theme]}
    </button>
  );
}
