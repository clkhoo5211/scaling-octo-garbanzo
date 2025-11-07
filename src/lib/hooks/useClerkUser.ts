"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { useUser, useAuth } from "@clerk/clerk-react";

/**
 * Enhanced useClerkUser Hook
 * Integrates Reown AppKit (PRIMARY) with Clerk (SECONDARY)
 * Priority: Reown authentication → Clerk user management
 */
export function useClerkUser() {
  const { address, isConnected } = useAppKitAccount();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Reown address to Clerk metadata when both are available
  useEffect(() => {
    if (
      clerkLoaded &&
      clerkUser &&
      isSignedIn &&
      isConnected &&
      address &&
      !isSyncing
    ) {
      const currentReownAddress = clerkUser.publicMetadata?.reown_address as
        | string
        | undefined;

      // Update Clerk metadata if Reown address is missing or different
      if (!currentReownAddress || currentReownAddress !== address) {
        setIsSyncing(true);
        clerkUser
          .update({
            publicMetadata: {
              ...clerkUser.publicMetadata,
              reown_address: address,
              smart_account_address: address,
            },
          })
          .then(() => {
            console.log("Synced Reown address to Clerk metadata");
          })
          .catch((error) => {
            console.error("Failed to sync Reown address:", error);
          })
          .finally(() => {
            setIsSyncing(false);
          });
      }
    }
  }, [
    address,
    isConnected,
    clerkUser,
    clerkLoaded,
    isSignedIn,
    isSyncing,
  ]);

  // Return Clerk user if available, otherwise return Reown-based user object
  if (clerkUser && isSignedIn) {
    return {
      user: clerkUser,
      isLoaded: clerkLoaded,
      isSignedIn: true,
      reownAddress: address,
      isReownConnected: isConnected,
    };
  }

  // Fallback: Return Reown-based user object if Clerk user doesn't exist yet
  if (isConnected && address) {
    return {
      user: {
        id: address.toLowerCase(),
        emailAddresses: clerkUser?.emailAddresses || [],
        primaryEmailAddress:
          clerkUser?.primaryEmailAddress ||
          ({ emailAddress: `${address.slice(0, 8)}@reown.app` } as any),
        username: address.slice(0, 8),
        createdAt: Date.now(),
        publicMetadata: {
          reown_address: address,
          smart_account_address: address,
        },
      },
      isLoaded: clerkLoaded,
      isSignedIn: false, // Not signed in to Clerk yet
      reownAddress: address,
      isReownConnected: true,
    };
  }

  return {
    user: null,
    isLoaded: clerkLoaded,
    isSignedIn: false,
    reownAddress: null,
    isReownConnected: false,
  };
}
