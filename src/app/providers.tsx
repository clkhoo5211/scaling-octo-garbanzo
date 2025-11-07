"use client";

import { ReactNode } from "react";
import ContextProvider from "@/context";
import { ToastProvider } from "@/components/ui/Toast";
import { ClerkProvider } from "@clerk/nextjs";
import { ReownClerkIntegration } from "@/components/auth/ReownClerkIntegration";

/**
 * Providers Component
 * Wraps app with Reown AppKit (PRIMARY) + Clerk (SECONDARY) + Wagmi + React Query
 * Priority: Reown handles authentication, Clerk handles user management
 * 
 * IMPORTANT: For static export (GitHub Pages), Clerk must be configured client-side only
 * No server-side features (Server Actions) are used
 */
export function Providers({ children }: { children: ReactNode }) {
  // For static export, we don't have access to cookies
  // This is fine - Wagmi will use localStorage instead
  return (
    <ContextProvider cookies={null}>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}
        // No sign-in/sign-up URLs - Clerk is ONLY for user management
        // All authentication handled by Reown (PRIMARY)
        // IMPORTANT: Clerk configured for client-side only (no Server Actions)
        // This allows static export to work properly
      >
        <ReownClerkIntegration>
          <ToastProvider>{children}</ToastProvider>
        </ReownClerkIntegration>
      </ClerkProvider>
    </ContextProvider>
  );
}
