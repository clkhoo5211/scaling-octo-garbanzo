"use client";

import { WalletConnect } from "@/components/web3/WalletConnect";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKit } from "@reown/appkit/react";

/**
 * AuthPage Component
 * PRIMARY: Reown AppKit (social logins + wallet connection)
 * Users click button to trigger login - no auto-prompt
 * 
 * CRITICAL: useAppKit hook must be called unconditionally (React rules)
 * The hook itself handles cases where AppKit isn't initialized yet
 */
export function AuthPage() {
  const { user, isLoaded } = useUser();
  
  // CRITICAL: Call hook unconditionally - React rules requirement
  // The hook will handle initialization errors internally
  const { open } = useAppKit();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              You&apos;re signed in as {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Connect Wallet</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect your wallet to participate in auctions, earn points, and
              vote on governance.
            </p>
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in page - user clicks button to trigger login
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please use the Reown modal to sign in with social login or email.
        </p>
        <button
          onClick={() => {
            // Safe to call - useAppKit hook handles initialization
            open({ view: "Connect" });
          }}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Open Sign In
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
