import { ReactNode, useEffect, useState } from "react";
import ContextProvider from "../../context/index";
import { ToastProvider } from "@/components/ui/Toast";
import { ConditionalClerkProvider } from "@/components/auth/ConditionalClerkProvider";
import { AppKitProvider } from "@reown/appkit/react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { appKit } from "../../context/index";
import type { AppKitInstance } from "@reown/appkit/react";

/**
 * Providers Component
 * Wraps app with Reown AppKit (PRIMARY) + Clerk (SECONDARY) + Wagmi + React Query
 * Priority: Reown handles authentication, Clerk handles user management
 * 
 * CRITICAL: According to Reown docs, use the appKit instance from createAppKit()
 * Reference: https://docs.reown.com/appkit/react/core/multichain#wagmi-%2B-solana
 * 
 * Smart Accounts are enabled by default per Reown docs:
 * https://docs.reown.com/appkit/react/core/smart-accounts
 */
export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [appKitInstance, setAppKitInstance] = useState<AppKitInstance | null>(null);

  // Only render AppKitProvider on client-side to prevent SSR issues
  useEffect(() => {
    setMounted(true);
    
    // Get the AppKit instance that was created with features configured
    // This instance already has email and social logins enabled
    if (typeof window !== 'undefined') {
      appKit.getInstance()
        .then((instance) => {
          if (instance) {
            setAppKitInstance(instance);
          }
        })
        .catch((error) => {
          console.error('Failed to get AppKit instance:', error);
        });
    }
  }, []);

  // CRITICAL: AppKitProvider MUST be rendered before any components use useAppKit hooks
  // So we wait for the instance to be ready before rendering AppKitProvider
  // Components like WalletConnect will show a loading state until AppKitProvider is ready
  // 
  // CRITICAL: ClerkProvider only initializes AFTER Reown authentication
  // This prevents Clerk API calls when user is not logged in
  return (
    <ContextProvider cookies={null}>
      {mounted && appKitInstance ? (
        <ErrorBoundary
          fallback={
            <ToastProvider>{children}</ToastProvider>
          }
        >
          <AppKitProvider appKit={appKitInstance}>
            <ConditionalClerkProvider>
              <ToastProvider>{children}</ToastProvider>
            </ConditionalClerkProvider>
          </AppKitProvider>
        </ErrorBoundary>
      ) : (
        // Render without AppKitProvider while initializing
        // Components should handle the "not ready" state gracefully
        <ToastProvider>{children}</ToastProvider>
      )}
    </ContextProvider>
  );
}
