import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, polygon } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Get projectId from environment variables
// CRITICAL: Don't throw during build - allow build to proceed without env vars
// They'll be available at runtime
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '';

// Only validate on client-side
if (typeof window !== 'undefined' && !projectId) {
  console.warn('Project ID is not defined. Please set VITE_REOWN_PROJECT_ID');
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, polygon];

// CRITICAL FIX: Lazy-load WagmiAdapter ONLY on client-side
// This prevents build hangs from trying to initialize Web3 connections during build
let wagmiAdapterInstance: WagmiAdapter | null = null;

export async function getWagmiAdapter(): Promise<WagmiAdapter | null> {
  // Only initialize on client-side (not during build)
  if (typeof window === 'undefined') {
    // During build, return a stub that won't cause hangs
    return null as any;
  }
  
  if (!wagmiAdapterInstance) {
    try {
      // CRITICAL: Use dynamic imports for ES modules (client-side only)
      const { WagmiAdapter } = await import('@reown/appkit-adapter-wagmi');
      const { cookieStorage, createStorage } = await import('@wagmi/core');
      
      wagmiAdapterInstance = new WagmiAdapter({
        storage: createStorage({
          storage: cookieStorage,
        }),
        ssr: false, // Client-side only
        projectId,
        networks,
      });
    } catch (error) {
      console.error('Failed to load WagmiAdapter:', error);
      return null;
    }
  }
  
  return wagmiAdapterInstance;
}

// For backward compatibility, export a getter (safe for build - returns undefined during SSR)
export const wagmiAdapter = {
  get wagmiConfig() {
    // Safe during build - return undefined if not on client-side
    if (typeof window === 'undefined') {
      return undefined as any;
    }
    // Note: This is async now, so this getter won't work properly
    // Components should use getWagmiAdapter() directly
    return undefined as any;
  }
};

// CRITICAL: Don't export config at module level - it will trigger initialization during build
// Use getWagmiAdapter().wagmiConfig instead, or access via wagmiAdapter.wagmiConfig getter
export async function getConfig() {
  if (typeof window === 'undefined') {
    return undefined as any;
  }
  const adapter = await getWagmiAdapter();
  return adapter?.wagmiConfig;
}

