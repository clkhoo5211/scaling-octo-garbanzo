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
    // Analytics & Tracking
    analytics: true,
    // Authentication Options
    email: true,
    socials: ["google", "twitter", "discord", "github", "apple"],
    emailShowWallets: true,
    // Payment Features
    onramp: true,
    swaps: true,
    // Activity & History
    activity: true,
    // Event Tracking
    events: true,
    // Reown Authentic (verification)
    authentic: true,
  },
  networks: networks as Array<{
    id: number;
    name: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: { default: { http: string[] } };
  }>,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#6366F1",
    "--w3m-background": "#0F172A",
  },
});
