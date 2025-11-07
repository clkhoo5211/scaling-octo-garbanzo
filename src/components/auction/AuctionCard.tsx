"use client";

import { formatDistanceToNow } from "date-fns";
import { Gavel, Clock, Users, DollarSign } from "lucide-react";
import { TransactionStatus } from "@/components/web3/TransactionStatus";

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
  );
}
