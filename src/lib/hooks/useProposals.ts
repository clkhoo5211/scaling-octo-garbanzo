/**
 * Governance Hooks
 * React Query hooks for governance features (proposals, votes)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProposals,
  getVotes,
  createVote,
  type Proposal,
  type Vote,
} from "@/lib/api/supabaseApi";
import { useAppStore } from "@/lib/stores/appStore";
import { useAppKitAccount } from "@reown/appkit/react";

/**
 * Hook to fetch governance proposals
 */
export function useProposals(filters?: {
  status?: "active" | "passed" | "rejected" | "pending" | "executed";
  category?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      const { data, error } = await getProposals(filters);
      if (error) throw error;
      return (data || []) as Proposal[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch votes for a proposal
 */
export function useVotes(proposalId: string) {
  return useQuery({
    queryKey: ["votes", proposalId],
    queryFn: async () => {
      const { data, error } = await getVotes(proposalId);
      if (error) throw error;
      return (data || []) as Vote[];
    },
    enabled: !!proposalId,
  });
}

/**
 * Hook to cast a vote on a proposal
 */
export function useVote() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();
  const { address, isConnected } = useAppKitAccount();

  return useMutation({
    mutationFn: async (data: {
      proposalId: string;
      voteOption: "yes" | "no" | "abstain";
      votingPower: number;
      transactionHash?: string;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }

      const { error } = await createVote({
        proposalId: data.proposalId,
        voterId: userId,
        voteOption: data.voteOption,
        votingPower: data.votingPower,
        transactionHash: data.transactionHash,
      });

      if (error) throw error;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["votes", data.proposalId] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({
        queryKey: ["user-vote", data.proposalId, userId],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to cast vote:", error);
    },
  });
}

/**
 * Hook to get user's vote on a proposal
 */
export function useUserVote(proposalId: string, userId: string | null) {
  return useQuery({
    queryKey: ["user-vote", proposalId, userId],
    queryFn: async () => {
      if (!userId || !proposalId) return null;

      const { data, error } = await getVotes(proposalId);
      if (error) throw error;

      const userVote = data?.find((vote) => vote.voter_id === userId);
      if (!userVote) return null;

      return {
        option:
          userVote.vote_option === 0
            ? "yes"
            : userVote.vote_option === 1
              ? "no"
              : "abstain",
        votingPower: userVote.voting_power,
        transactionHash: userVote.transaction_hash || undefined,
      };
    },
    enabled: !!userId && !!proposalId,
  });
}
