"use client";

/**
 * DailyLoginPointsHandler Component
 * Awards daily login streak points when user logs in
 * Runs once per day when user is authenticated
 */

import { useEffect, useRef } from "react";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useAwardDailyLoginPoints } from "@/lib/hooks/usePointsEarning";

export function DailyLoginPointsHandler() {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  const awardDailyLoginPoints = useAwardDailyLoginPoints();
  const hasAwardedRef = useRef(false);

  useEffect(() => {
    // Only run if user is loaded and signed in
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    // Prevent multiple calls in the same render cycle
    if (hasAwardedRef.current) {
      return;
    }

    // Check if we've already awarded today
    const lastLoginDate = user.publicMetadata?.last_login_date as string | undefined;
    const today = new Date().toISOString().split("T")[0];

    if (lastLoginDate === today) {
      // Already awarded today, skip
      hasAwardedRef.current = true;
      return;
    }

    // Award daily login points
    hasAwardedRef.current = true;
    awardDailyLoginPoints().catch((error) => {
      console.error("Failed to award daily login points:", error);
      hasAwardedRef.current = false; // Reset on error so it can retry
    });
  }, [user, isLoaded, isSignedIn, awardDailyLoginPoints]);

  // Reset ref when user changes
  useEffect(() => {
    hasAwardedRef.current = false;
  }, [user?.id]);

  return null; // This component doesn't render anything
}

