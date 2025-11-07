'use client';

import { projectId, getWagmiAdapter } from '@/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, polygon } from '@reown/appkit/networks';
import React, { type ReactNode, useEffect, useState } from 'react';
import { cookieToInitialState, WagmiProvider, createConfig, http } from 'wagmi';
import type { Config } from 'wagmi';

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

// CRITICAL: Create a safe stub config for build/SSR (lazy-loaded)
// This allows WagmiProvider to render during static generation without errors
function getStubConfig(): Config {
  if (typeof window === 'undefined') {
    // During build, return a minimal stub that won't cause hangs
    // We'll use dynamic import to avoid accessing browser APIs
    const { createConfig, http } = require('wagmi');
    return createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
    }) as Config;
  }
  // On client-side, this won't be used (real config will be available)
  return null as any;
}

// CRITICAL FIX: Initialize AppKit unconditionally with SSR support
// During Next.js static export/prerendering, components using useAppKit hooks are rendered on server
// AppKit must be initialized before hooks are called, even during SSR
let appKitInstance: ReturnType<typeof createAppKit> | null = null;

function getAppKit() {
  if (!appKitInstance) {
    const adapter = getWagmiAdapter();
    // During SSR/build, adapter might be null - create a minimal stub
    if (!adapter) {
      // Create a minimal stub adapter for SSR
      const { createConfig, http } = require('wagmi');
      const stubConfig = createConfig({
        chains: [mainnet],
        transports: {
          [mainnet.id]: http(),
        },
      });
      
      // Create stub adapter for SSR
      const { WagmiAdapter } = require('@reown/appkit-adapter-wagmi');
      const stubAdapter = new WagmiAdapter({
        networks: [mainnet],
        projectId,
        ssr: true,
      });
      
      appKitInstance = createAppKit({
        adapters: [stubAdapter],
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
    } else {
      // Client-side: use real adapter
      appKitInstance = createAppKit({
        adapters: [adapter],
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
  }
  
  return appKitInstance;
}

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // CRITICAL: Initialize AppKit BEFORE rendering to prevent "createAppKit before useAppKit" error
  // This must happen synchronously during module load, not in useEffect
  // During SSR, AppKit will use stub adapter; on client, it will use real adapter
  const appKit = getAppKit();
  
  // CRITICAL: Initialize Wagmi config
  useEffect(() => {
    setIsClient(true);
    const adapter = getWagmiAdapter();
    if (adapter) {
      setWagmiConfig(adapter.wagmiConfig as Config);
    }
  }, []);
  
  // CRITICAL: Always render WagmiProvider (use stub during build, real config on client)
  // This prevents Reown hooks from failing during static generation
  const config = wagmiConfig || (typeof window === 'undefined' ? getStubConfig() : null);
  const initialState = isClient && typeof window !== 'undefined' && cookies && wagmiConfig
    ? cookieToInitialState(wagmiConfig, cookies)
    : undefined;
  
  // If no config available (shouldn't happen, but safety check)
  if (!config) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;

