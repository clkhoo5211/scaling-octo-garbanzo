"use client";

import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount } from "@reown/appkit/react";
import { WalletConnect } from "@/components/web3/WalletConnect";
import { useEffect, useState } from "react";
import Link from "next/link";

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
 * 
 * CRITICAL: Client-only to prevent hydration mismatches with useAppKitAccount
 */
export function AuthStatus() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { isConnected } = useAppKitAccount();
  const [mounted, setMounted] = useState(false);

  // CRITICAL: Only render after mount to prevent hydration mismatch
  // useAppKitAccount() may return different values during SSR vs client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR/hydration - but ALWAYS show WalletConnect
  if (!mounted || !clerkLoaded) {
    return (
      <div className="flex items-center gap-2">
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Info - Only show if wallet is NOT connected and Clerk user exists */}
      {/* When wallet is connected, WalletConnect shows the address, so we hide user info to avoid duplication */}
      {user && !isConnected && (
        <Link 
          href="/profile" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="View Profile"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer">
            {user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ||
              "U"}
          </div>
          <span className="text-sm font-medium hidden sm:inline">
            {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
          </span>
        </Link>
      )}

      {/* Profile Link for Desktop - Show when wallet is connected */}
      {user && isConnected && (
        <Link
          href="/profile"
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="View Profile"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ||
              "U"}
          </div>
          <span className="text-sm font-medium">Profile</span>
        </Link>
      )}

      {/* Wallet/Sign In - WalletConnect handles both */}
      {/* When wallet is connected, this shows the address */}
      {/* When wallet is NOT connected, this shows the connect button */}
      <WalletConnect />
    </div>
  );
}
