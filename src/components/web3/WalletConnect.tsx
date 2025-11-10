import { useSafeAppKitAccount, useSafeAppKit } from "@/lib/hooks/useSafeAppKit";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * WalletConnectInternal Component
 * Uses AppKit hooks - only render when AppKitProvider is ready
 */
function WalletConnectInternal() {
  const { address, isConnected } = useSafeAppKitAccount();
  const { open } = useSafeAppKit();
  const [copied, setCopied] = useState(false);

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

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-card border border-primary/20 bg-primary/10 px-3 py-2 text-primary">
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-medium text-primary-dark">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={handleCopyAddress}
          className="rounded-card p-2 text-text-tertiary transition-smooth hover:bg-surface-subtle hover:text-text-primary"
          aria-label={copied ? "Address copied" : "Copy address"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => open({ view: "Account" })}
          className="rounded-card p-2 text-text-tertiary transition-smooth hover:bg-surface-subtle hover:text-text-primary"
          aria-label="Open account menu"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="flex items-center gap-2 rounded-button bg-primary px-4 py-2 text-white shadow-card transition-smooth hover:bg-primary-dark"
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </button>
  );
}

/**
 * WalletConnect Component
 * Connects wallet using Reown AppKit
 * Handles AppKit initialization gracefully by checking if AppKitProvider is ready
 */
export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const [appKitReady, setAppKitReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if AppKitProvider is in the tree
    // AppKitProvider is only rendered when appKitInstance is ready
    // So we check if the instance exists on window (set by context/index.tsx)
    if (typeof window !== 'undefined') {
      let checkCount = 0;
      const maxChecks = 100; // 10 seconds max
      
      const checkAppKit = setInterval(() => {
        checkCount++;
        
        // Check if AppKit instance exists (means AppKitProvider should be rendered)
        const hasAppKitInstance = !!(window as any).__REOWN_APPKIT_INSTANCE__;
        
        // Also check if AppKitProvider has been rendered by checking React context
        // We can't directly check React context, but we can check if instance exists
        // and wait a bit for AppKitProvider to render
        if (hasAppKitInstance) {
          // Give AppKitProvider time to render (one more tick)
          setTimeout(() => {
            setAppKitReady(true);
          }, 200);
          clearInterval(checkAppKit);
        } else if (checkCount >= maxChecks) {
          // Timeout - AppKit might not be initializing
          // Set ready anyway so component can try to render (will show error if not ready)
          setAppKitReady(true);
          clearInterval(checkAppKit);
        }
      }, 100);
      
      return () => {
        clearInterval(checkAppKit);
      };
    }
  }, []);

  if (!mounted) {
    return (
      <button
        className="flex items-center gap-2 rounded-button bg-primary px-4 py-2 text-white opacity-60"
        disabled
      >
        <Wallet className="h-4 w-4" />
        <span>Loading...</span>
      </button>
    );
  }

  // Only render WalletConnectInternal when AppKitProvider is ready
  // If not ready, show a loading state
  if (!appKitReady) {
    return (
      <button
        className="flex items-center gap-2 rounded-button bg-primary px-4 py-2 text-white opacity-60"
        disabled
      >
        <Wallet className="h-4 w-4" />
        <span>Initializing...</span>
      </button>
    );
  }

  // Render the component that uses AppKit hooks
  // If AppKitProvider is not ready, this will throw an error
  // which will be caught by ErrorBoundary in Providers
  return <WalletConnectInternal />;
}
