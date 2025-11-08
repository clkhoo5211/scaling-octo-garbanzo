import { ReactNode, useEffect, useState } from "react";
import ContextProvider from "../../context/index";
import { ToastProvider } from "@/components/ui/Toast";
import { ClerkProvider } from "@clerk/clerk-react";
import { ReownClerkIntegration } from "@/components/auth/ReownClerkIntegration";
import { AppKitProvider } from "@reown/appkit/react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { appKit } from "../../context/index";

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
  const [appKitInstance, setAppKitInstance] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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
          setIsInitializing(false);
        })
        .catch((error) => {
          console.error('Failed to get AppKit instance:', error);
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, []);

  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

  // CRITICAL: AppKitProvider MUST be rendered before any components use useAppKit hooks
  // So we wait for the instance to be ready before rendering AppKitProvider
  // Components like WalletConnect will show a loading state until AppKitProvider is ready
  return (
    <ContextProvider cookies={null}>
      {mounted && appKitInstance ? (
        <ErrorBoundary
          fallback={
            <ClerkProvider publishableKey={clerkPublishableKey}>
              <ReownClerkIntegration>
                <ToastProvider>{children}</ToastProvider>
              </ReownClerkIntegration>
            </ClerkProvider>
          }
        >
          <AppKitProvider appKit={appKitInstance}>
            <ClerkProvider publishableKey={clerkPublishableKey}>
              <ReownClerkIntegration>
                <ToastProvider>{children}</ToastProvider>
              </ReownClerkIntegration>
            </ClerkProvider>
          </AppKitProvider>
        </ErrorBoundary>
      ) : (
        // Render without AppKitProvider while initializing
        // Components should handle the "not ready" state gracefully
        <ClerkProvider publishableKey={clerkPublishableKey}>
          <ReownClerkIntegration>
            <ToastProvider>{children}</ToastProvider>
          </ReownClerkIntegration>
        </ClerkProvider>
      )}
    </ContextProvider>
  );
}
