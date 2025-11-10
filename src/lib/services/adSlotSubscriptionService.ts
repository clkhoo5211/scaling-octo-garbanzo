/**
 * Ad Slot Subscription Service
 * Handles subscribing/unsubscribing to ad slots for notifications
 * Per requirements: Award 10 points when subscribing
 * 
 * NOTE: Subscriptions are stored in Clerk publicMetadata, not Supabase
 */

// Type from Clerk useUser hook - user can be null
type ClerkUser = NonNullable<ReturnType<typeof import("@clerk/clerk-react").useUser>['user']>;
import { awardPoints } from "@/lib/services/pointsService";

export interface AdSlotSubscription {
  id: string;
  clerk_id: string;
  slot_id: string;
  notification_email: boolean;
  notification_push: boolean;
  created_at: string;
}

export interface SubscribeToSlotParams {
  userId: string;
  user: ClerkUser;
  slotId: string;
  notificationEmail?: boolean;
  notificationPush?: boolean;
}

/**
 * Get subscriptions from Clerk publicMetadata
 */
function getSubscriptionsFromMetadata(user: ClerkUser): AdSlotSubscription[] {
  const metadata = user.publicMetadata as Record<string, unknown>;
  const subscriptions = metadata?.ad_slot_subscriptions as AdSlotSubscription[] | undefined;
  return subscriptions || [];
}

/**
 * Save subscriptions to Clerk publicMetadata
 */
async function saveSubscriptionsToMetadata(
  user: ClerkUser,
  subscriptions: AdSlotSubscription[]
): Promise<void> {
  await user.update({
    publicMetadata: {
      ...(user.publicMetadata as Record<string, unknown>),
      ad_slot_subscriptions: subscriptions,
    },
  } as Parameters<typeof user.update>[0]);
}

/**
 * Subscribe to an ad slot for notifications
 * Awards 10 points (one-time) per requirements
 */
export async function subscribeToSlot({
  userId,
  user,
  slotId,
  notificationEmail = true,
  notificationPush = true,
}: SubscribeToSlotParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current subscriptions from Clerk metadata
    const subscriptions = getSubscriptionsFromMetadata(user);
    
    // Check if already subscribed
    const existing = subscriptions.find((sub) => sub.slot_id === slotId);
    if (existing) {
      return {
        success: false,
        error: "Already subscribed to this slot",
      };
    }

    // Create new subscription
    const newSubscription: AdSlotSubscription = {
      id: `${userId}-${slotId}-${Date.now()}`,
      clerk_id: userId,
      slot_id: slotId,
      notification_email: notificationEmail,
      notification_push: notificationPush,
      created_at: new Date().toISOString(),
    };

    // Save to Clerk metadata
    const updatedSubscriptions = [...subscriptions, newSubscription];
    await saveSubscriptionsToMetadata(user, updatedSubscriptions);

    // Award 10 points (one-time) per requirements
    const pointsResult = await awardPoints({
      userId,
      user,
      amount: 10,
      reason: "Subscribed to ad slot",
      source: "ad_slot_subscription",
    });

    if (!pointsResult.success) {
      console.warn("Failed to award points for ad slot subscription:", pointsResult.error);
      // Don't fail the subscription if points fail
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to subscribe to ad slot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Unsubscribe from an ad slot
 */
export async function unsubscribeFromSlot(
  userId: string,
  slotId: string,
  user: ClerkUser
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current subscriptions from Clerk metadata
    const subscriptions = getSubscriptionsFromMetadata(user);
    
    // Remove subscription
    const updatedSubscriptions = subscriptions.filter(
      (sub) => sub.slot_id !== slotId
    );

    // Save to Clerk metadata
    await saveSubscriptionsToMetadata(user, updatedSubscriptions);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to unsubscribe from ad slot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all slots user is subscribed to
 */
export async function getSubscribedSlots(
  userId: string,
  user: ClerkUser
): Promise<{ data: AdSlotSubscription[]; error: Error | null }> {
  try {
    // Get subscriptions from Clerk metadata
    const subscriptions = getSubscriptionsFromMetadata(user);
    
    // Sort by created_at descending
    const sortedSubscriptions = subscriptions.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return {
      data: sortedSubscriptions,
      error: null,
    };
  } catch (error) {
    console.error("Failed to get subscribed slots:", error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Update notification preferences for a subscription
 */
export async function updateSubscriptionPreferences(
  userId: string,
  slotId: string,
  notificationEmail: boolean,
  notificationPush: boolean,
  user: ClerkUser
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current subscriptions from Clerk metadata
    const subscriptions = getSubscriptionsFromMetadata(user);
    
    // Find and update subscription
    const updatedSubscriptions = subscriptions.map((sub) => {
      if (sub.slot_id === slotId) {
        return {
          ...sub,
          notification_email: notificationEmail,
          notification_push: notificationPush,
        };
      }
      return sub;
    });

    // Check if subscription exists
    const subscriptionExists = subscriptions.some((sub) => sub.slot_id === slotId);
    if (!subscriptionExists) {
      return {
        success: false,
        error: "Subscription not found",
      };
    }

    // Save to Clerk metadata
    await saveSubscriptionsToMetadata(user, updatedSubscriptions);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update subscription preferences:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
