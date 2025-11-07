"use client";

import { ReactNode } from "react";
import ContextProvider from "@/context";
import { ToastProvider } from "@/components/ui/Toast";
// CRITICAL FIX: Use @clerk/clerk-react instead of @clerk/nextjs for static export
// @clerk/nextjs imports server-actions which causes "Server Actions are not supported" error
// @clerk/clerk-react is pure client-side and works perfectly with static export
import { ClerkProvider } from "@clerk/clerk-react";
import { ReownClerkIntegration } from "@/components/auth/ReownClerkIntegration";

/**
 * Providers Component
 * Wraps app with Reown AppKit (PRIMARY) + Clerk (SECONDARY) + Wagmi + React Query
 * Priority: Reown handles authentication, Clerk handles user management
 * 
 * IMPORTANT: For static export (GitHub Pages), using @clerk/clerk-react instead of @clerk/nextjs
 * This avoids the "Server Actions are not supported with static export" error
 * See: https://github.com/clerk/javascript/issues/4647
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
        // Using @clerk/clerk-react avoids server-actions import
      >
        <ReownClerkIntegration>
          <ToastProvider>{children}</ToastProvider>
        </ReownClerkIntegration>
      </ClerkProvider>
    </ContextProvider>
  );
}
