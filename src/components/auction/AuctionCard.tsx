"use client";

"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Gavel, Clock, Users, DollarSign, Bell, BellOff, Loader2 } from "lucide-react";
import { TransactionStatus } from "@/components/web3/TransactionStatus";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useToast } from "@/components/ui/Toast";
import {
  subscribeToSlot,
  unsubscribeFromSlot,
  getSubscribedSlots,
} from "@/lib/services/adSlotSubscriptionService";

interface AuctionCardProps {
  auction: {
    id: string;
    ad_slot_id?: string;
    slotId?: string;
    title?: string;
    description?: string;
    current_bid?: number;
    currentBid?: string | number;
    currentBidder?: string;
    highest_bidder_address?: string | null;
    end_time?: string;
    endTime?: string;
    total_bids?: number;
    participants?: number;
    min_bid_increment?: number;
    status: "active" | "ended" | "settled" | "pending";
  };
  onBid?: (auctionId: string) => void;
  txHash?: string;
}

/**
 * AuctionCard Component
 * Displays ad auction information
 */
export function AuctionCard({ auction, onBid, txHash }: AuctionCardProps) {
  const { user } = useClerkUser();
  const { addToast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const endTime =
    auction.end_time || auction.endTime || new Date().toISOString();
  const currentBid =
    auction.current_bid || parseFloat(String(auction.currentBid || "0"));
  const slotId = auction.ad_slot_id || auction.slotId || auction.id;
  const participants = auction.total_bids || auction.participants || 0;
  const bidder = auction.highest_bidder_address || auction.currentBidder;

  const isEnded = new Date(endTime) < new Date();
  const timeRemaining = formatDistanceToNow(new Date(endTime), {
    addSuffix: true,
  });

  // Check subscription status
  useEffect(() => {
    if (user) {
      getSubscribedSlots(user.id).then((result) => {
        if (!result.error) {
          const subscribed = result.data.some((sub) => sub.slot_id === slotId);
          setIsSubscribed(subscribed);
        }
      });
    }
  }, [user, slotId]);

  const handleSubscribe = async () => {
    if (!user) {
      addToast({ message: "Please sign in to subscribe", type: "error" });
      return;
    }

    setIsUpdating(true);
    try {
      const result = await subscribeToSlot({
        userId: user.id,
        user,
        slotId,
      });

      if (result.success) {
        setIsSubscribed(true);
        addToast({
          message: "Subscribed! You'll receive notifications when this auction opens.",
          type: "success",
        });
        await user.reload(); // Refresh to update points
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
      setIsUpdating(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const result = await unsubscribeFromSlot(user.id, slotId);

      if (result.success) {
        setIsSubscribed(false);
        addToast({
          message: "Unsubscribed from ad slot",
          type: "success",
        });
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
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Transaction Status */}
      {txHash && <TransactionStatus hash={txHash} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {auction.title || `Ad Slot #${slotId.substring(0, 8)}`}
          </h3>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            auction.status === "active"
              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          {auction.status}
        </span>
      </div>

      {/* Description */}
      {auction.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {auction.description}
        </p>
      )}

      {/* Current Bid */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Current Bid
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentBid.toFixed(2)} USDT
          </span>
        </div>
        {bidder && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Bidder: {bidder.slice(0, 8)}...
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium">{participants}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Participants
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium">
              {isEnded ? "Ended" : timeRemaining}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Time Remaining
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {/* Subscribe Button */}
        <button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isUpdating}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isSubscribed
              ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-green-500 text-white hover:bg-green-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSubscribed ? (
            <>
              <BellOff className="w-4 h-4" />
              <span>Unsubscribe</span>
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              <span>Subscribe for Notifications</span>
            </>
          )}
        </button>

        {/* Bid Button */}
        {auction.status === "active" && !isEnded && (
          <button
            onClick={() => {
              if (onBid) {
                onBid(auction.id);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>Place Bid</span>
          </button>
        )}
      </div>
    </div>
  );
}
