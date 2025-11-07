"use client";

import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount } from "@reown/appkit/react";
import { Wallet, User } from "lucide-react";
import { WalletConnect } from "@/components/web3/WalletConnect";

/**
 * AuthStatus Component
 * Shows current authentication status (Clerk + Reown)
 */
export function AuthStatus() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { isConnected: walletConnected } = useAppKitAccount();

  if (!clerkLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Clerk User Info */}
      {user ? (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ||
              "U"}
          </div>
          <span className="text-sm font-medium hidden sm:inline">
            {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
          </span>
        </div>
      ) : (
        <a
          href="/auth"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <User className="w-4 h-4" />
          <span>Sign In</span>
        </a>
      )}

      {/* Wallet Status */}
      {walletConnected ? (
        <WalletConnect />
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Wallet className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Not Connected
          </span>
        </div>
      )}
    </div>
  );
}
