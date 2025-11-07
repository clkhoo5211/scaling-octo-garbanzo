/**
 * Reown AppKit Configuration
 * Web3 wallet connection and authentication (PRIMARY)
 * Social logins and email enabled
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
    email: true, // Enable email login
    socials: ["google", "x", "github", "discord", "apple"], // Enable social logins
  },
  networks: networks as Array<{
    id: number;
    name: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: { default: { http: string[] } };
  }>,
});
