import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  // CRITICAL: Use NEXT_PUBLIC_BASE_PATH for client-side access
  // During build, GITHUB_REPOSITORY_NAME is available, but at runtime we need NEXT_PUBLIC_BASE_PATH
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || 
    (process.env.GITHUB_REPOSITORY_NAME ? `/${process.env.GITHUB_REPOSITORY_NAME}` : "");
  
  return {
    name: "Web3News - Decentralized News Aggregation",
    short_name: "Web3News",
    description: "Decentralized news aggregation with crypto-powered rewards",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: `${basePath}/icon-192x192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${basePath}/icon-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["news", "social", "crypto"],
    orientation: "portrait",
    prefer_related_applications: false,
  };
}
