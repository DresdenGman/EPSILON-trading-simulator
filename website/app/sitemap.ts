import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/landing`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/impact`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/download`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/methodology`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/status`, changeFrequency: "weekly", priority: 0.5 },
  ];
}
