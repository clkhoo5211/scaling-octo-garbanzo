/**
 * Reown AppKit Configuration
 * Web3 wallet connection and authentication (PRIMARY)
 */

import { createAppKit } from "@reown/appkit/react";

// Use a simpler network config to avoid build issues
const networks = [
  {
    id: 1,
    name: "Ethereum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://eth.llamarpc.com"] } },
  },
  {
    id: 137,
    name: "Polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: { default: { http: ["https://polygon.llamarpc.com"] } },
  },
];

export const appKit = createAppKit({
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "",
  metadata: {
    name: "Web3News",
    description: "Decentralized news aggregation with crypto-powered rewards",
    url:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://web3news.xyz",
    icons: ["/icon-192x192.png", "/icon-512x512.png"],
  },
  features: {
    analytics: true,
    email: true,
    socials: ["google", "twitter", "discord", "github"],
    emailShowWallets: true,
  },
  networks: networks as any,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#6366F1",
    "--w3m-background": "#0F172A",
  },
});
