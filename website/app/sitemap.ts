import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/landing`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/download`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
