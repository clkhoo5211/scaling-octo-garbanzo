"use client";

import { ReactNode, useEffect, useState } from "react";
import ContextProvider from "@/context";
import { appKit } from "@/context";
import { ToastProvider } from "@/components/ui/Toast";
// CRITICAL FIX: Use @clerk/clerk-react instead of @clerk/nextjs for static export
// @clerk/nextjs imports server-actions which causes "Server Actions are not supported" error
// @clerk/clerk-react is pure client-side and works perfectly with static export
import { ClerkProvider } from "@clerk/clerk-react";
import { ReownClerkIntegration } from "@/components/auth/ReownClerkIntegration";
import { AppKitProvider } from "@reown/appkit/react";

/**
 * Providers Component
 * Wraps app with Reown AppKit (PRIMARY) + Clerk (SECONDARY) + Wagmi + React Query
 * Priority: Reown handles authentication, Clerk handles user management
 * 
 * IMPORTANT: For static export (GitHub Pages), using @clerk/clerk-react instead of @clerk/nextjs
 * This avoids the "Server Actions are not supported with static export" error
 * See: https://github.com/clerk/javascript/issues/4647
 * 
 * CRITICAL: AppKitProvider must wrap components that use useAppKit hooks to initialize the iframe
 */
export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [appKitReady, setAppKitReady] = useState(false);

  // Only render AppKitProvider on client-side to prevent SSR issues
  useEffect(() => {
    setMounted(true);
    
    // Ensure appKit is initialized before rendering AppKitProvider
    if (typeof window !== 'undefined') {
      // Check if appKit is available
      if (appKit) {
        setAppKitReady(true);
      } else {
        // Wait a bit for appKit to initialize
        const timer = setTimeout(() => {
          setAppKitReady(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // For static export, we don't have access to cookies
  // This is fine - Wagmi will use localStorage instead
  // CRITICAL: AppKitProvider must be inside ContextProvider (WagmiProvider)
  // because it needs access to the Wagmi config from ContextProvider
  return (
    <ContextProvider cookies={null}>
      {/* CRITICAL: AppKitProvider must wrap components using useAppKit hooks */}
      {/* This initializes the W3mFrame iframe that was missing */}
      {/* Only render AppKitProvider when mounted and appKit is ready */}
      {mounted && appKitReady && appKit ? (
        <AppKitProvider>
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}
            // No sign-in/sign-up URLs - Clerk is ONLY for user management
            // All authentication handled by Reown (PRIMARY)
            // Using @clerk/clerk-react avoids server-actions import
          >
            <ReownClerkIntegration>
              <ToastProvider>{children}</ToastProvider>
            </ReownClerkIntegration>
          </ClerkProvider>
        </AppKitProvider>
      ) : (
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}
        >
          <ReownClerkIntegration>
            <ToastProvider>{children}</ToastProvider>
          </ReownClerkIntegration>
        </ClerkProvider>
      )}
    </ContextProvider>
  );
}
