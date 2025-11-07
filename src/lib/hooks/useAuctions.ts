/**
 * Auction Hooks
 * React Query hooks for auction features
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAuctions,
  getAuctionBids,
  createAuctionBid,
  type Auction,
  type AuctionBid,
} from "@/lib/api/supabaseApi";
import { useAppStore } from "@/lib/stores/appStore";
import { useAppKitAccount } from "@reown/appkit/react";

/**
 * Hook to fetch auctions
 */
export function useAuctions(filters?: {
  status?: "active" | "ended" | "settled";
  limit?: number;
}) {
  return useQuery({
    queryKey: ["auctions", filters],
    queryFn: async () => {
      const { data, error } = await getAuctions(filters);
      if (error) throw error;
      return (data || []) as Auction[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (auctions change frequently)
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch bids for an auction
 */
export function useAuctionBids(auctionId: string) {
  return useQuery({
    queryKey: ["auction-bids", auctionId],
    queryFn: async () => {
      const { data, error } = await getAuctionBids(auctionId);
      if (error) throw error;
      return (data || []) as AuctionBid[];
    },
    enabled: !!auctionId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
  });
}

/**
 * Hook to place a bid on an auction
 */
export function usePlaceBid() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();
  const { address, isConnected } = useAppKitAccount();

  return useMutation({
    mutationFn: async (data: {
      auctionId: string;
      bidAmount: number;
      transactionHash?: string;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }

      const { error } = await createAuctionBid({
        auctionId: data.auctionId,
        bidderAddress: address,
        bidAmount: data.bidAmount,
        transactionHash: data.transactionHash,
      });

      if (error) throw error;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["auction-bids", data.auctionId],
      });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
    },
    onError: (error: Error) => {
      console.error("Failed to place bid:", error);
    },
  });
}

/**
 * Hook to get user's bids on auctions
 */
export function useUserBids(userAddress: string | null) {
  return useQuery({
    queryKey: ["user-bids", userAddress],
    queryFn: async () => {
      if (!userAddress) return [];

      // Fetch all auctions and filter bids by user address
      const { data: auctions, error } = await getAuctions();
      if (error) throw error;

      const userBids: Array<AuctionBid & { auction: Auction }> = [];
      for (const auction of auctions || []) {
        const { data: bids, error: bidsError } = await getAuctionBids(
          auction.id
        );
        if (bidsError) continue;

        const userAuctionBids =
          bids?.filter(
            (bid) =>
              bid.bidder_address.toLowerCase() === userAddress.toLowerCase()
          ) || [];

        userAuctionBids.forEach((bid) => {
          userBids.push({ ...bid, auction });
        });
      }

      return userBids;
    },
    enabled: !!userAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
