"use client";

import { WalletConnect } from "@/components/web3/WalletConnect";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKit } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";

/**
 * AuthPage Component
 * PRIMARY: Reown AppKit (social logins + wallet connection)
 * Users click button to trigger login - no auto-prompt
 * 
 * CRITICAL: useAppKit hook must be called unconditionally (React rules)
 * We use a guard to ensure AppKit is initialized before using it
 */
export function AuthPage() {
  const { user, isLoaded } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  
  // CRITICAL: Call hook unconditionally - React rules requirement
  // The hook will handle initialization errors internally
  const appKit = useAppKit();
  const open = appKit?.open;

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isLoaded || !isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-base">
        <LoadingState message="Preparing sign-in..." />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-base px-4 py-10">
        <div className="w-full max-w-xl space-y-6 rounded-card border border-border-subtle bg-background-elevated p-8 shadow-elevated">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-text-primary">Welcome back!</h1>
            <p className="text-text-secondary">
              You&apos;re signed in as {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="rounded-card border border-border-subtle bg-surface-primary p-6 shadow-card">
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Connect Wallet</h2>
            <p className="mb-4 text-sm text-text-secondary">
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
    <div className="flex min-h-screen items-center justify-center bg-background-base px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-text-primary">Sign In</h1>
          <p className="text-text-secondary">
          Please use the Reown modal to sign in with social login or email.
        </p>
        </div>
        <Button
          onClick={() => {
            // Safe to call - AppKit should be initialized by now
            if (open) {
              open({ view: "Connect" });
            }
          }}
          disabled={!open}
          size="lg"
          className="mt-8 w-full justify-center"
        >
          Open Sign In
        </Button>
        {!open && (
          <p className="mt-3 text-xs text-text-tertiary">
            Loading Reown AppKit...
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
