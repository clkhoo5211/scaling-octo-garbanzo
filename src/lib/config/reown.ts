/**
 * Reown AppKit Configuration (DEPRECATED)
 * 
 * This file is deprecated. The proper implementation is now in:
 * - config/index.tsx (WagmiAdapter configuration)
 * - context/index.tsx (AppKit modal creation with WagmiProvider)
 * 
 * This file is kept for backward compatibility but should not be used.
 * All AppKit functionality is now handled through the WagmiAdapter setup.
 */

import { createAppKit } from "@reown/appkit/react";
import { mainnet, polygon } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

// Use proper AppKitNetwork types from @reown/appkit/networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, polygon];

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
  networks: networks,
});
