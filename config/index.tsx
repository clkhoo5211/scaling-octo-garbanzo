import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, polygon } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Get projectId from environment variables
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '';

if (!projectId) {
  throw new Error('Project ID is not defined. Please set NEXT_PUBLIC_REOWN_PROJECT_ID');
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, polygon];

// CRITICAL FIX: Lazy-load WagmiAdapter ONLY on client-side
// This prevents build hangs from trying to initialize Web3 connections during static generation
let wagmiAdapterInstance: WagmiAdapter | null = null;

export function getWagmiAdapter(): WagmiAdapter {
  // Only initialize on client-side (not during build/SSR)
  if (typeof window === 'undefined') {
    throw new Error('WagmiAdapter can only be initialized on the client side');
  }
  
  if (!wagmiAdapterInstance) {
    // CRITICAL: Import WagmiAdapter and storage ONLY when needed (client-side)
    const { WagmiAdapter } = require('@reown/appkit-adapter-wagmi');
    const { cookieStorage, createStorage } = require('@wagmi/core');
    
    wagmiAdapterInstance = new WagmiAdapter({
      storage: createStorage({
        storage: cookieStorage,
      }),
      ssr: false, // CRITICAL: Disable SSR for static export
      projectId,
      networks,
    });
  }
  
  return wagmiAdapterInstance;
}

// For backward compatibility, export a getter (but it will throw during build - that's OK)
export const wagmiAdapter = {
  get wagmiConfig() {
    return getWagmiAdapter().wagmiConfig;
  }
};

// CRITICAL: Don't export config at module level - it will trigger initialization during build
// Use getWagmiAdapter().wagmiConfig instead, or access via wagmiAdapter.wagmiConfig getter
export function getConfig() {
  return getWagmiAdapter().wagmiConfig;
}

