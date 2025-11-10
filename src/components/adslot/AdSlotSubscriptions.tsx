"use client";

/**
 * Ad Slot Subscriptions Component
 * Displays and manages user's ad slot subscriptions
 * Per requirements: Show subscribed slots, allow subscribe/unsubscribe
 */

import { useState, useEffect } from "react";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import {
  subscribeToSlot,
  unsubscribeFromSlot,
  getSubscribedSlots,
  updateSubscriptionPreferences,
} from "@/lib/services/adSlotSubscriptionService";
import { Bell, BellOff, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function AdSlotSubscriptions() {
  const { user, isLoaded } = useClerkUser();
  const { addToast } = useToast();
  const [subscribedSlots, setSubscribedSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);

  useEffect(() => {
    if (user && isLoaded) {
      loadSubscriptions();
    }
  }, [user, isLoaded]);

  const loadSubscriptions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await getSubscribedSlots(user.id, user);
      if (result.error) {
        throw result.error;
      }
      setSubscribedSlots(result.data);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      addToast({
        message: "Failed to load ad slot subscriptions",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (slotId: string) => {
    if (!user) return;

    setUpdatingSlot(slotId);
    try {
      const result = await subscribeToSlot({
        userId: user.id,
        user,
        slotId,
      });

      if (result.success) {
        addToast({
          message: "Subscribed to ad slot! You'll receive notifications when auctions open.",
          type: "success",
        });
        await loadSubscriptions();
        // Refresh user to update points
        await user.reload();
      } else {
        addToast({
          message: result.error || "Failed to subscribe",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        message: error instanceof Error ? error.message : "Failed to subscribe",
        type: "error",
      });
    } finally {
      setUpdatingSlot(null);
    }
  };

  const handleUnsubscribe = async (slotId: string) => {
    if (!user) return;

    setUpdatingSlot(slotId);
    try {
      const result = await unsubscribeFromSlot(user.id, slotId, user);

      if (result.success) {
        addToast({
          message: "Unsubscribed from ad slot",
          type: "success",
        });
        // Reload user to refresh metadata
        await user.reload();
        await loadSubscriptions();
      } else {
        addToast({
          message: result.error || "Failed to unsubscribe",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        message: error instanceof Error ? error.message : "Failed to unsubscribe",
        type: "error",
      });
    } finally {
      setUpdatingSlot(null);
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Ad Slot Subscriptions
        </h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Subscribe to ad slots to receive notifications when auctions open. You'll earn 10 points for each subscription.
      </p>

      {subscribedSlots.length === 0 ? (
        <div className="text-center py-8">
          <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            You're not subscribed to any ad slots yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Visit the{" "}
            <a href="/auctions" className="text-blue-500 hover:text-blue-600">
              Auctions page
            </a>{" "}
            to subscribe to slots.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscribedSlots.map((subscription) => (
            <div
              key={subscription.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {subscription.slot_id}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    {subscription.notification_email ? (
                      <Bell className="w-4 h-4 text-green-500" />
                    ) : (
                      <BellOff className="w-4 h-4 text-gray-400" />
                    )}
                    Email
                  </span>
                  <span className="flex items-center gap-1">
                    {subscription.notification_push ? (
                      <Bell className="w-4 h-4 text-green-500" />
                    ) : (
                      <BellOff className="w-4 h-4 text-gray-400" />
                    )}
                    Push
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUnsubscribe(subscription.slot_id)}
                disabled={updatingSlot === subscription.slot_id}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updatingSlot === subscription.slot_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Unsubscribe"
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

