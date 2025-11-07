"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { useUser, useAuth } from "@clerk/clerk-react";

const MOCK_USER_STORAGE_KEY = "admin_dev_user";

interface MockUserData {
  id: string;
  emailAddresses?: Array<{ emailAddress: string }>;
  primaryEmailAddress?: { emailAddress: string };
}

/**
 * Enhanced useClerkUser Hook
 * Integrates Reown AppKit (PRIMARY) with Clerk (SECONDARY)
 * Priority: Mock user (dev) → Clerk user → Reown-based user
 */
export function useClerkUser() {
  const { address, isConnected } = useAppKitAccount();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [mockUser, setMockUserState] = useState<MockUserData | null>(null);
  const [mockUserLoaded, setMockUserLoaded] = useState(false);

  // Load mock user from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMockUserState(parsed);
      }
    } catch (error) {
      console.error("Failed to load mock user from localStorage:", error);
    } finally {
      setMockUserLoaded(true);
    }
  }, []);

  // Function to set mock user (for admin key login)
  const setMockUser = useCallback((userData: MockUserData) => {
    if (typeof window === "undefined") return;

    try {
      const userToStore = {
        id: userData.id,
        emailAddresses: userData.emailAddresses || [],
        primaryEmailAddress:
          userData.primaryEmailAddress ||
          (userData.emailAddresses?.[0]
            ? { emailAddress: userData.emailAddresses[0].emailAddress }
            : { emailAddress: "admin@dev.local" }),
      };
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(userToStore));
      setMockUserState(userToStore);
    } catch (error) {
      console.error("Failed to save mock user to localStorage:", error);
    }
  }, []);

  // Function to clear mock user (for logout)
  const clearMockUser = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
      setMockUserState(null);
    } catch (error) {
      console.error("Failed to clear mock user from localStorage:", error);
    }
  }, []);

  // Sync Reown address to Clerk metadata when both are available
  // Skip sync if mock user is active (development mode)
  useEffect(() => {
    if (
      mockUser ||
      !clerkLoaded ||
      !clerkUser ||
      !isSignedIn ||
      !isConnected ||
      !address ||
      isSyncing
    ) {
      return;
    }

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
  }, [
    address,
    isConnected,
    clerkUser,
    clerkLoaded,
    isSignedIn,
    isSyncing,
    mockUser,
  ]);

  // Priority 1: Mock user (development/admin key login)
  if (mockUser && mockUserLoaded) {
    return {
      user: {
        id: mockUser.id,
        emailAddresses: mockUser.emailAddresses || [],
        primaryEmailAddress:
          mockUser.primaryEmailAddress ||
          (mockUser.emailAddresses?.[0]
            ? { emailAddress: mockUser.emailAddresses[0].emailAddress }
            : { emailAddress: "admin@dev.local" }),
        username: mockUser.id,
        createdAt: Date.now(),
        publicMetadata: {},
      } as any,
      isLoaded: true,
      isSignedIn: true,
      reownAddress: address,
      isReownConnected: isConnected,
      setMockUser,
      clearMockUser,
    };
  }

  // Priority 2: Return Clerk user if available
  if (clerkUser && isSignedIn) {
    return {
      user: clerkUser,
      isLoaded: clerkLoaded && mockUserLoaded,
      isSignedIn: true,
      reownAddress: address,
      isReownConnected: isConnected,
      setMockUser,
      clearMockUser,
    };
  }

  // Priority 3: Fallback: Return Reown-based user object if Clerk user doesn't exist yet
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
      isLoaded: clerkLoaded && mockUserLoaded,
      isSignedIn: false, // Not signed in to Clerk yet
      reownAddress: address,
      isReownConnected: true,
      setMockUser,
      clearMockUser,
    };
  }

  return {
    user: null,
    isLoaded: clerkLoaded && mockUserLoaded,
    isSignedIn: false,
    reownAddress: null,
    isReownConnected: false,
    setMockUser,
    clearMockUser,
  };
}
