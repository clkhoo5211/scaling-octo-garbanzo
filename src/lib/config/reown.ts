/**
 * Reown AppKit Configuration
 * Web3 wallet connection and authentication (PRIMARY)
 */

import { createAppKit } from '@reown/appkit/react';
import { Ethereum, Polygon, BSC, Arbitrum, Optimism, Base } from '@reown/appkit/networks';

export const appKit = createAppKit({
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '',
  metadata: {
    name: 'Web3News',
    description: 'Decentralized news aggregation with crypto-powered rewards',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://web3news.xyz',
    icons: ['/icon-192x192.png', '/icon-512x512.png'],
  },
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'twitter', 'discord', 'github'],
    emailShowWallets: true,
  },
  networks: [
    Ethereum,
    Polygon,
    BSC,
    Arbitrum,
    Optimism,
    Base,
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#6366F1',
    '--w3m-background': '#0F172A',
  },
});

