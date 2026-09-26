import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AgentStore — AI Agent Marketplace",
    short_name: "AgentStore",
    description: "Discover, buy, and deploy production-grade AI agents and autonomous workflows.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090e",
    theme_color: "#00f0ff",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
