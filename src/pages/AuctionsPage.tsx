import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { useAuctions } from "@/lib/hooks/useAuctions";
import { Gavel } from "lucide-react";

export default function AuctionsPage() {
  const { data: auctions, isLoading, error } = useAuctions();

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Ad Auctions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bid on ad slots to promote your content
          </p>
        </div>

        {isLoading ? (
          <LoadingState message="Loading auctions..." />
        ) : error ? (
          <EmptyState
            title="Failed to load auctions"
            message="Please try refreshing the page"
            icon={<Gavel className="w-12 h-12 text-gray-400" />}
          />
        ) : !auctions || auctions.length === 0 ? (
          <EmptyState
            title="No active auctions"
            message="Check back later for new ad slot auctions"
            icon={<Gavel className="w-12 h-12 text-gray-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={{
                  id: auction.id,
                  ad_slot_id: auction.ad_slot_id,
                  title: auction.title,
                  description: auction.description,
                  current_bid: auction.current_bid,
                  currentBid: auction.current_bid.toString(),
                  highest_bidder_address: auction.highest_bidder_address,
                  currentBidder: auction.highest_bidder_address || undefined,
                  end_time: auction.end_time,
                  endTime: auction.end_time,
                  total_bids: auction.total_bids,
                  participants: auction.total_bids,
                  status: auction.status,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

