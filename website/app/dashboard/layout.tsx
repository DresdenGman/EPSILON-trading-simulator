import React from "react";
import type { Metadata } from "next";
import DashboardClientLayout from "./layout-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Research Workspace",
  description: "Observe a market subject, test a hypothesis, interrogate the evidence, and retest inside EPSILON.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
