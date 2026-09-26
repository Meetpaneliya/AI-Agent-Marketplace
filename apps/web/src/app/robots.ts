import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agentstore.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/agents",
          "/agents/*",
          "/categories",
          "/categories/*",
        ],
        disallow: [
          "/seller",
          "/seller/*",
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
