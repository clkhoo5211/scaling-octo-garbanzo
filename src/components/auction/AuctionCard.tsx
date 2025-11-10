"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Gavel, Clock, Users, DollarSign, Bell, BellOff, Loader2 } from "lucide-react";
import { TransactionStatus } from "@/components/web3/TransactionStatus";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
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
      getSubscribedSlots(user.id, user).then((result) => {
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
      const result = await unsubscribeFromSlot(user.id, slotId, user);

      if (result.success) {
        setIsSubscribed(false);
        addToast({
          message: "Unsubscribed from ad slot",
          type: "success",
        });
        await user.reload(); // Refresh to update metadata
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
    <div className="rounded-card border border-border-subtle bg-background-elevated p-6 shadow-card transition-smooth">
      {/* Transaction Status */}
      {txHash && <TransactionStatus hash={txHash} />}

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Gavel className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-semibold text-text-primary">
            {auction.title || `Ad Slot #${slotId.substring(0, 8)}`}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            auction.status === "active"
              ? "bg-success/15 text-success"
              : "bg-surface-subtle text-text-secondary"
          }`}
        >
          {auction.status}
        </span>
      </div>

      {/* Description */}
      {auction.description && (
        <p className="mb-5 text-sm leading-relaxed text-text-secondary">
          {auction.description}
        </p>
      )}

      {/* Current Bid */}
      <div className="mb-5">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-sm text-text-tertiary">
            Current Bid
          </span>
          <span className="text-2xl font-bold text-text-primary">
            {currentBid.toFixed(2)} USDT
          </span>
        </div>
        {bidder && (
          <div className="text-xs text-text-tertiary">
            Bidder: {bidder.slice(0, 8)}...
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-subtle/60 px-4 py-3">
          <Users className="h-4 w-4 text-text-tertiary" />
          <div>
            <div className="text-sm font-semibold text-text-primary">{participants}</div>
            <div className="text-xs text-text-tertiary">
              Participants
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-subtle/60 px-4 py-3">
          <Clock className="h-4 w-4 text-text-tertiary" />
          <div>
            <div className="text-sm font-semibold text-text-primary">
              {isEnded ? "Ended" : timeRemaining}
            </div>
            <div className="text-xs text-text-tertiary">
              Time Remaining
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Subscribe Button */}
        <Button
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isUpdating}
          variant={isSubscribed ? "secondary" : "primary"}
          className="w-full"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSubscribed ? (
            <>
              <BellOff className="h-4 w-4" />
              <span>Unsubscribe</span>
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              <span>Subscribe for Notifications</span>
            </>
          )}
        </Button>

      {/* Bid Button */}
      {auction.status === "active" && !isEnded && (
        <Button
          onClick={() => {
            if (onBid) {
              onBid(auction.id);
            }
          }}
          variant="secondary"
          className="w-full bg-info text-white hover:bg-info/90"
        >
          <DollarSign className="h-4 w-4" />
          <span>Place Bid</span>
        </Button>
      )}
      </div>
    </div>
  );
}
