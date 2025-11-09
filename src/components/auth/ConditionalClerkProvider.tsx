"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { useAppKitAccount } from "@reown/appkit/react";
import { ReownClerkIntegration } from "./ReownClerkIntegration";
import { ClerkFaviconUpdater } from "@/components/clerk/ClerkFaviconUpdater";

/**
 * Conditional ClerkProvider Wrapper
 * Only initializes Clerk after Reown authentication is established
 * This prevents Clerk API calls when user is not logged in
 */
export function ConditionalClerkProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAppKitAccount();
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

  // CRITICAL: Only render ClerkProvider after Reown connection is established
  // This prevents Clerk from making API calls when user is not authenticated
  if (!isConnected || !address) {
    // User not authenticated via Reown - don't initialize Clerk
    return <>{children}</>;
  }

  // User authenticated via Reown - safe to initialize Clerk for user management
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ClerkFaviconUpdater />
      <ReownClerkIntegration>
        {children}
      </ReownClerkIntegration>
    </ClerkProvider>
  );
}

