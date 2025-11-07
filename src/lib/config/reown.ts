/**
 * Reown AppKit Configuration
 * Web3 wallet connection and authentication (PRIMARY)
 * Using default AppKit configuration with social logins enabled
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
  // Use AppKit defaults - features are controlled by dashboard settings
  // Social logins enabled by default
  networks: networks as Array<{
    id: number;
    name: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: { default: { http: string[] } };
  }>,
});
