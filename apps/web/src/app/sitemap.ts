import type { MetadataRoute } from "next";
import { AGENTS_CATALOG } from "@/lib/agents-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agentstore.ai";
  const now = new Date();

  // Core static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  // Dynamic individual agent detail routes
  const agentRoutes: MetadataRoute.Sitemap = AGENTS_CATALOG.map((agent) => ({
    url: `${baseUrl}/agents/${agent.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...agentRoutes];
}

