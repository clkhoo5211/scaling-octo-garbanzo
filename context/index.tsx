import { projectId, getWagmiAdapter } from '../config/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, polygon } from '@reown/appkit/networks';
import React, { type ReactNode, useEffect, useState } from 'react';
import { cookieToInitialState, WagmiProvider, createConfig, http } from 'wagmi';
import type { Config } from 'wagmi';

// Set up queryClient
const queryClient = new QueryClient();

// Don't throw error immediately - handle gracefully
// Project ID will be validated when AppKit is actually initialized
if (typeof window !== 'undefined' && !projectId) {
  console.warn('⚠️ Project ID is not defined. Please set VITE_REOWN_PROJECT_ID in your .env file');
}

// Set up metadata
const metadata = {
  name: 'Web3News',
  description: 'Decentralized news aggregation with crypto-powered rewards',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://web3news.xyz',
  icons: ['/icon-192x192.png', '/icon-512x512.png'],
};

// CRITICAL: Create a safe stub config for SSR (lazy-loaded)
function getStubConfig(): Config {
  if (typeof window === 'undefined') {
    return createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
    }) as Config;
  }
  return null as any;
}

// CRITICAL FIX: Initialize AppKit asynchronously on client-side only
let appKitInstance: ReturnType<typeof createAppKit> | null = null;
let appKitInitializing = false;

async function initializeAppKit() {
  if (appKitInstance) {
    return appKitInstance;
  }

  if (appKitInitializing) {
    // Wait for initialization to complete
    return new Promise<ReturnType<typeof createAppKit> | null>((resolve) => {
      const checkInterval = setInterval(() => {
        if (appKitInstance) {
          clearInterval(checkInterval);
          resolve(appKitInstance);
        } else if (!appKitInitializing) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100);
    });
  }

  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return null;
  }

  // Don't initialize if projectId is missing
  if (!projectId) {
    console.warn('⚠️ Cannot initialize AppKit: Project ID is not defined');
    return null;
  }

  appKitInitializing = true;

  try {
    const adapter = await getWagmiAdapter();
    
    if (adapter) {
      appKitInstance = createAppKit({
        adapters: [adapter],
        projectId,
        networks: [mainnet, polygon],
        defaultNetwork: mainnet,
        metadata: metadata,
        features: {
          analytics: false, // Disabled to prevent Coinbase analytics errors when blocked by ad blockers
          // All other features (email, socials, onramp, swaps) are managed via dashboard.reown.com
        },
      });
      
      // Expose instance on window for components to check if AppKit is ready
      if (typeof window !== 'undefined') {
        (window as any).__REOWN_APPKIT_INSTANCE__ = appKitInstance;
        (window as any).__REOWN_APPKIT_CONTEXT__ = true;
      }
      
      appKitInitializing = false;
      return appKitInstance;
    }
  } catch (error) {
    console.error('Failed to initialize AppKit:', error);
    appKitInitializing = false;
    return null;
  }

  appKitInitializing = false;
  return null;
}

// Initialize AppKit on client-side immediately (don't wait)
// This ensures AppKit is available when AppKitProvider renders
if (typeof window !== 'undefined') {
  // Start initialization immediately but don't block
  initializeAppKit().catch((error) => {
    console.warn('AppKit initialization failed (will retry):', error);
  });
}

// Export a getter that returns the instance (or null if not initialized yet)
export const appKit = {
  get instance() {
    return appKitInstance;
  },
  async getInstance() {
    if (!appKitInstance) {
      await initializeAppKit();
    }
    return appKitInstance;
  }
};

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // CRITICAL: Initialize Wagmi config and AppKit on client-side
  useEffect(() => {
    setIsClient(true);
    
    // Initialize AppKit
    initializeAppKit().catch(console.error);
    
    // Initialize Wagmi adapter
    getWagmiAdapter().then((adapter) => {
      if (adapter) {
        setWagmiConfig(adapter.wagmiConfig as Config);
      }
    }).catch(console.error);
  }, []);
  
  const config = wagmiConfig || (typeof window === 'undefined' ? getStubConfig() : null);
  const initialState = isClient && typeof window !== 'undefined' && cookies && wagmiConfig
    ? cookieToInitialState(wagmiConfig, cookies)
    : undefined;
  
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

