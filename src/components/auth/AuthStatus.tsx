"use client";

import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { WalletConnect } from "@/components/web3/WalletConnect";

/**
 * AuthStatus Component
 * Shows current authentication status
 * PRIMARY: Reown AppKit (social logins + wallet)
 * Removed separate Sign In button - WalletConnect handles both wallet and sign-in
 */
export function AuthStatus() {
  const { user, isLoaded: clerkLoaded } = useUser();

  if (!clerkLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Info - Only show if user exists and wallet is NOT connected */}
      {user && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ||
              "U"}
          </div>
          <span className="text-sm font-medium hidden sm:inline">
            {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
          </span>
        </div>
      )}

      {/* Wallet/Sign In - WalletConnect handles both */}
      {/* Note: WalletConnect will show address if connected, so we don't duplicate it */}
      <WalletConnect />
    </div>
  );
}
