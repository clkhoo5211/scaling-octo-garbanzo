/**
 * Ad Slot Subscription Service
 * Handles subscribing/unsubscribing to ad slots for notifications
 * Per requirements: Award 10 points when subscribing
 */

import { createPointsTransaction } from "@/lib/api/supabaseApi";
import { supabase } from "@/lib/services/supabase";
import type { User } from "@clerk/clerk-react";
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
  user: User;
  slotId: string;
  notificationEmail?: boolean;
  notificationPush?: boolean;
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
    // Check if already subscribed
    const { data: existing } = await supabase
      .from("slot_subscriptions")
      .select("*")
      .eq("clerk_id", userId)
      .eq("slot_id", slotId)
      .single();

    if (existing) {
      return {
        success: false,
        error: "Already subscribed to this slot",
      };
    }

    // Create subscription
    const { error: insertError } = await supabase
      .from("slot_subscriptions")
      .insert({
        clerk_id: userId,
        slot_id: slotId,
        notification_email: notificationEmail,
        notification_push: notificationPush,
      });

    if (insertError) {
      throw insertError;
    }

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
  slotId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("slot_subscriptions")
      .delete()
      .eq("clerk_id", userId)
      .eq("slot_id", slotId);

    if (error) {
      throw error;
    }

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
  userId: string
): Promise<{ data: AdSlotSubscription[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("slot_subscriptions")
      .select("*")
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      data: (data || []) as AdSlotSubscription[],
      error: null,
    };
  } catch (error) {
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
  notificationPush: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("slot_subscriptions")
      .update({
        notification_email: notificationEmail,
        notification_push: notificationPush,
      })
      .eq("clerk_id", userId)
      .eq("slot_id", slotId);

    if (error) {
      throw error;
    }

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

