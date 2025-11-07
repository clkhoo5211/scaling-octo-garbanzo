"use client";

import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * WalletConnect Component
 * Connects wallet using Reown AppKit
 * CRITICAL: Only render on client-side to prevent hydration mismatches
 */
export function WalletConnect() {
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // CRITICAL: Only render after mount to prevent hydration mismatch
  // useAppKitAccount() may return different values during SSR vs client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Show loading state during SSR/hydration
  if (!mounted) {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors animate-pulse"
        disabled
      >
        <Wallet className="w-4 h-4" />
        <span>Loading...</span>
      </button>
    );
  }

  // If AppKit isn't ready, show button anyway
  if (!open) {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        onClick={() => {
          console.warn('AppKit not ready yet');
          window.location.reload();
        }}
      >
        <Wallet className="w-4 h-4" />
        <span>Connect to Sign In</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={handleCopyAddress}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={copied ? "Address copied" : "Copy address"}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        <button
          onClick={() => open({ view: "Account" })}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Open account menu"
        >
          <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect to Sign In</span>
    </button>
  );
}
