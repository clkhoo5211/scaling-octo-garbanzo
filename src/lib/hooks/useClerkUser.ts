"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";

/**
 * Client-side only useUser hook for static export
 * Integrates with Reown AppKit for authentication (PRIMARY)
 * Also supports admin key for development
 */
export function useClerkUser() {
  const { address, isConnected } = useAppKitAccount();
  const [user, setUser] = useState<{
    id: string;
    emailAddresses?: Array<{ emailAddress: string }>;
    primaryEmailAddress?: { emailAddress: string };
    username?: string;
    createdAt?: number | string;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user from localStorage on mount (for admin key)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("clerk_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // Ignore parse errors
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Sync Reown AppKit authentication state
  useEffect(() => {
    if (isLoaded) {
      if (isConnected && address) {
        // User is authenticated via Reown AppKit
        // Check if we already have a user object, otherwise create one from Reown
        const storedUser = localStorage.getItem("clerk_user");
        if (!storedUser) {
          // Create user object from Reown account
          const reownUser = {
            id: address.toLowerCase(), // Use address as ID
            emailAddresses: [], // Reown doesn't expose email directly
            primaryEmailAddress: { emailAddress: `${address.slice(0, 6)}...@reown.app` }, // Placeholder
            username: address.slice(0, 8),
            createdAt: Date.now(),
          };
          // Store in localStorage for persistence
          localStorage.setItem("clerk_user", JSON.stringify(reownUser));
          setUser(reownUser);
        } else {
          // User already exists in localStorage, use it
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            // If parse fails, create from Reown
            const reownUser = {
              id: address.toLowerCase(),
              emailAddresses: [],
              primaryEmailAddress: { emailAddress: `${address.slice(0, 6)}...@reown.app` },
              username: address.slice(0, 8),
              createdAt: Date.now(),
            };
            localStorage.setItem("clerk_user", JSON.stringify(reownUser));
            setUser(reownUser);
          }
        }
      } else {
        // Not connected via Reown - check if admin key user exists
        const storedUser = localStorage.getItem("clerk_user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            // Only keep admin key user if it's the admin user
            if (parsed.id === "admin-dev-user") {
              setUser(parsed);
            } else {
              // Clear non-admin user when Reown disconnects
              localStorage.removeItem("clerk_user");
              setUser(null);
            }
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    }
  }, [isConnected, address, isLoaded]);

  // Function to set mock user (for admin key development)
  const setMockUser = useCallback((mockUser: {
    id: string;
    emailAddresses?: Array<{ emailAddress: string }>;
    primaryEmailAddress?: { emailAddress: string };
    username?: string;
    createdAt?: number | string;
  }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clerk_user", JSON.stringify(mockUser));
      setUser(mockUser);
    }
  }, []);

  // isSignedIn: true if Reown is connected OR admin key user exists
  const isSignedIn = (isConnected && address) || !!user;

  return {
    user,
    isLoaded,
    isSignedIn,
    setMockUser, // Expose for admin key feature
  };
}
