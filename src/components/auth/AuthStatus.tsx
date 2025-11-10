"use client";

import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount } from "@reown/appkit/react";
import { WalletConnect } from "@/components/web3/WalletConnect";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  // Show loading state during SSR/hydration - but ALWAYS show WalletConnect button
  // Don't wait for mounted/clerkLoaded - show button immediately
  return (
    <div className="flex items-center gap-3">
      {/* User Info - Only show if wallet is NOT connected and Clerk user exists */}
      {mounted && clerkLoaded && user && !isConnected && (
        <Link 
          to="/profile" 
          className="flex items-center gap-2 rounded-card px-2 py-1 text-text-secondary transition-smooth hover:bg-surface-subtle hover:text-text-primary"
          title="View Profile"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ||
              "U"}
          </div>
          <span className="hidden text-sm font-medium sm:inline">
            {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
          </span>
        </Link>
      )}

      {/* Profile Link for Desktop - Show when wallet is connected */}
      {mounted && clerkLoaded && user && isConnected && (
        <Link
          to="/profile"
          className="hidden items-center gap-2 rounded-card px-3 py-2 text-text-secondary transition-smooth hover:bg-surface-subtle hover:text-text-primary md:flex"
          title="View Profile"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ||
              "U"}
        </div>
          <span className="text-sm font-medium">Profile</span>
        </Link>
      )}

      {/* Wallet/Sign In - WalletConnect handles both - ALWAYS show */}
      <WalletConnect />
    </div>
  );
}
