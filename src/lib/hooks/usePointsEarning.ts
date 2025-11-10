"use client";

/**
 * Points Earning Hook
 * Handles points earning for various user actions
 */

import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useUser } from "@clerk/clerk-react"; // Import actual Clerk user hook
import { awardPoints, POINTS_RULES } from "@/lib/services/pointsService";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";

/**
 * Hook to award points for sharing an article
 */
export function useAwardSharePoints() {
  const { user: clerkUserWrapper } = useClerkUser();
  const { user: clerkUser } = useUser(); // Get actual Clerk user
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return async (articleId: string, articleTitle: string) => {
    // Only proceed if we have a real Clerk user with update method
    if (!clerkUserWrapper || !clerkUser || typeof clerkUser.update !== 'function') {
      console.warn("Cannot award points: No Clerk user available");
      return;
    }

    try {
      const result = await awardPoints({
        userId: clerkUser.id,
        user: clerkUser, // Use actual Clerk user
        amount: POINTS_RULES.SHARE_ARTICLE,
        reason: `Shared article: ${articleTitle}`,
        source: "share",
      });

      if (result.success) {
        // Invalidate points queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ["points-transactions", clerkUser.id] });
        queryClient.invalidateQueries({ queryKey: ["user", clerkUser.id] });
        
        addToast({
          message: `+${POINTS_RULES.SHARE_ARTICLE} points for sharing!`,
          type: "success",
        });
      }
    } catch (error) {
      console.error("Failed to award share points:", error);
    }
  };
}

/**
 * Hook to award points when user receives an upvote
 * Note: This should be called when someone else likes the user's content
 */
export function useAwardUpvotePoints() {
  const { user: clerkUserWrapper } = useClerkUser();
  const { user: clerkUser } = useUser(); // Get actual Clerk user
  const queryClient = useQueryClient();

  return async (articleAuthorId: string, articleTitle: string) => {
    // Only proceed if we have a real Clerk user with update method
    if (!clerkUserWrapper || !clerkUser || typeof clerkUser.update !== 'function') {
      return;
    }

    // Only award if the upvote is for the current user's content
    if (clerkUser.id !== articleAuthorId) return;

    try {
      const result = await awardPoints({
        userId: clerkUser.id,
        user: clerkUser, // Use actual Clerk user
        amount: POINTS_RULES.RECEIVE_UPVOTE,
        reason: `Received upvote on: ${articleTitle}`,
        source: "upvote",
      });

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["points-transactions", clerkUser.id] });
        queryClient.invalidateQueries({ queryKey: ["user", clerkUser.id] });
      }
    } catch (error) {
      console.error("Failed to award upvote points:", error);
    }
  };
}

/**
 * Hook to award daily login streak points
 */
export function useAwardDailyLoginPoints() {
  const { user: clerkUserWrapper } = useClerkUser();
  const { user: clerkUser } = useUser(); // Get actual Clerk user
  const queryClient = useQueryClient();

  return async () => {
    // Only proceed if we have a real Clerk user with update method
    if (!clerkUserWrapper || !clerkUser || typeof clerkUser.update !== 'function') {
      console.warn("Cannot award daily login points: No Clerk user available");
      return;
    }

    try {
      // Check last login date
      const lastLoginDate = clerkUser.publicMetadata?.last_login_date as string | undefined;
      const today = new Date().toISOString().split("T")[0];

      // Award points only once per day
      if (lastLoginDate === today) {
        return; // Already awarded today
      }

      // Calculate streak
      let streak = (clerkUser.publicMetadata?.login_streak as number) || 0;
      if (lastLoginDate) {
        const lastLogin = new Date(lastLoginDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastLoginDate === yesterdayStr) {
          streak += 1; // Continue streak
        } else {
          streak = 1; // Reset streak
        }
      } else {
        streak = 1; // First login
      }

      // Award points (20 points per day, max 100-day streak bonus)
      const pointsToAward = Math.min(streak, 100) * POINTS_RULES.DAILY_LOGIN;

      const result = await awardPoints({
        userId: clerkUser.id,
        user: clerkUser, // Use actual Clerk user
        amount: pointsToAward,
        reason: `Daily login streak (${streak} days)`,
        source: "login",
      });

      if (result.success) {
        // Update login streak metadata using actual Clerk user
        // CRITICAL: Must use proper structure - Clerk expects publicMetadata object
        await clerkUser.update({
          publicMetadata: {
            ...(clerkUser.publicMetadata as Record<string, unknown> || {}),
            last_login_date: today,
            login_streak: streak,
          },
        });

        queryClient.invalidateQueries({ queryKey: ["points-transactions", clerkUser.id] });
        queryClient.invalidateQueries({ queryKey: ["user", clerkUser.id] });
      }
    } catch (error) {
      console.error("Failed to award daily login points:", error);
    }
  };
}

