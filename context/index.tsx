'use client';

import { wagmiAdapter, projectId, getWagmiAdapter } from '@/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, polygon } from '@reown/appkit/networks';
import React, { type ReactNode, useEffect, useState } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Set up metadata
const metadata = {
  name: 'Web3News',
  description: 'Decentralized news aggregation with crypto-powered rewards',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://web3news.xyz',
  icons: ['/icon-192x192.png', '/icon-512x512.png'],
};

// CRITICAL FIX: Lazy-load AppKit ONLY on client-side
// This prevents build hangs from trying to initialize Web3 connections during static generation
let appKitInstance: ReturnType<typeof createAppKit> | null = null;

function getAppKit() {
  // Only initialize on client-side (not during build/SSR)
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!appKitInstance) {
    appKitInstance = createAppKit({
      adapters: [getWagmiAdapter()],
      projectId,
      networks: [mainnet, polygon],
      defaultNetwork: mainnet,
      metadata: metadata,
      features: {
        analytics: true,
        email: true,
        socials: ['google', 'x', 'github', 'discord', 'apple'],
        onramp: true,
        swaps: true,
      },
    });
  }
  
  return appKitInstance;
}

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);
  
  // CRITICAL: Only initialize Wagmi config on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adapter = getWagmiAdapter();
      setWagmiConfig(adapter.wagmiConfig as Config);
      // Initialize AppKit (side effect)
      getAppKit();
    }
  }, []);
  
  // CRITICAL: For static export, skip cookie-based initialState during build
  const initialState = typeof window !== 'undefined' && cookies && wagmiConfig
    ? cookieToInitialState(wagmiConfig, cookies)
    : undefined;
  
  // Don't render WagmiProvider until config is ready (client-side only)
  if (!wagmiConfig) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;

