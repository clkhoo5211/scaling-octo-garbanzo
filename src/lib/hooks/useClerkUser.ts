"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Client-side only useUser hook for static export
 * Clerk's useUser uses server actions, so we create a client-side alternative
 */
export function useClerkUser() {
  const [user, setUser] = useState<{
    id: string;
    emailAddresses?: Array<{ emailAddress: string }>;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // For static export, check localStorage for user data
      // In production, this would integrate with Clerk's client SDK
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

  // Function to set mock user (for admin key development)
  const setMockUser = useCallback((mockUser: {
    id: string;
    emailAddresses?: Array<{ emailAddress: string }>;
  }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clerk_user", JSON.stringify(mockUser));
      setUser(mockUser);
    }
  }, []);

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    setMockUser, // Expose for admin key feature
  };
}
