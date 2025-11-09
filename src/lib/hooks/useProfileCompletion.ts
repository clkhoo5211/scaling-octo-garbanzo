"use client";

/**
 * Profile Completion Hook
 * Checks if user profile is complete and awards points
 */

import { useEffect, useRef } from "react";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useUser } from "@clerk/clerk-react"; // Import actual Clerk user hook
import { awardPoints, POINTS_RULES } from "@/lib/services/pointsService";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";

/**
 * Check if user profile is complete
 * Profile is considered complete if:
 * - Has email address
 * - Has username
 * - Has Reown address connected
 */
function isProfileComplete(user: any): boolean {
  if (!user) return false;

  const hasEmail = !!(
    user.primaryEmailAddress?.emailAddress ||
    (user.emailAddresses && user.emailAddresses.length > 0)
  );
  const hasUsername = !!user.username;
  const hasReownAddress = !!(user.publicMetadata?.reown_address as string);

  return hasEmail && hasUsername && hasReownAddress;
}

/**
 * Hook to check and award profile completion points
 * Awards 500 points one-time when profile is completed
 */
export function useProfileCompletionPoints() {
  const { user: clerkUserWrapper } = useClerkUser();
  const { user: clerkUser } = useUser(); // Get actual Clerk user
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only proceed if we have a real Clerk user with update method
    if (!clerkUserWrapper || !clerkUser || typeof clerkUser.update !== 'function') {
      return;
    }

    // Check if already awarded
    const profileCompleted = clerkUser.publicMetadata?.profile_completed as boolean | undefined;
    if (profileCompleted) {
      hasCheckedRef.current = true;
      return;
    }

    // Prevent multiple checks
    if (hasCheckedRef.current) {
      return;
    }

    // Check if profile is complete
    if (isProfileComplete(clerkUser)) {
      hasCheckedRef.current = true;

      // Award points
      awardPoints({
        userId: clerkUser.id,
        user: clerkUser, // Use actual Clerk user
        amount: POINTS_RULES.PROFILE_COMPLETION,
        reason: "Profile completion bonus",
        source: "profile_completion",
      })
        .then((result) => {
          if (result.success) {
            // Update Clerk metadata using actual Clerk user
            clerkUser
              .update({
                publicMetadata: {
                  ...clerkUser.publicMetadata,
                  profile_completed: true,
                },
              })
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ["points-transactions", clerkUser.id] });
                queryClient.invalidateQueries({ queryKey: ["user", clerkUser.id] });

                addToast({
                  message: `+${POINTS_RULES.PROFILE_COMPLETION} points for completing your profile!`,
                  type: "success",
                });
              })
              .catch((error) => {
                console.error("Failed to update profile completion status:", error);
              });
          }
        })
        .catch((error) => {
          console.error("Failed to award profile completion points:", error);
          hasCheckedRef.current = false; // Reset on error so it can retry
        });
    }
  }, [clerkUserWrapper, clerkUser, queryClient, addToast]);

  // Reset ref when user changes
  useEffect(() => {
    hasCheckedRef.current = false;
  }, [clerkUser?.id]);

  return {
    isComplete: clerkUser ? isProfileComplete(clerkUser) : false,
    hasBeenAwarded: clerkUser?.publicMetadata?.profile_completed as boolean | undefined,
  };
}

