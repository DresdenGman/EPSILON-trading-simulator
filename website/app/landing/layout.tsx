import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EPSILON — Quantitative Decision Lab",
  description: "Build a market idea, test it, and try to break it through one transparent research cycle.",
  alternates: { canonical: "/landing" },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
