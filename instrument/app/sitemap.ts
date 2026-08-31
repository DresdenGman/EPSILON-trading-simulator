import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://epsilonfield.space";
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/lab`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/status`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/impact`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
