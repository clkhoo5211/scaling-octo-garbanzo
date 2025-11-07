"use client";

import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount } from "@reown/appkit/react";
import { WalletConnect } from "@/components/web3/WalletConnect";

/**
 * AuthStatus Component
 * Shows current authentication status
 * PRIMARY: Reown AppKit (social logins + wallet)
 * Removed separate Sign In button - WalletConnect handles both wallet and sign-in
 * 
 * Logic:
 * - If wallet is connected: Show wallet address only (WalletConnect component)
 * - If wallet NOT connected but Clerk user exists: Show Clerk user info + connect button
 * - If neither: Show connect button only
 */
export function AuthStatus() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { isConnected } = useAppKitAccount();

  if (!clerkLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Info - Only show if wallet is NOT connected and Clerk user exists */}
      {/* When wallet is connected, WalletConnect shows the address, so we hide user info to avoid duplication */}
      {user && !isConnected && (
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
      {/* When wallet is connected, this shows the address */}
      {/* When wallet is NOT connected, this shows the connect button */}
      <WalletConnect />
    </div>
  );
}
