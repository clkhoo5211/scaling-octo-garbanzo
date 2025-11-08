import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { ProposalCard } from "@/components/governance/ProposalCard";
import { useProposals, useVote, useUserVote } from "@/lib/hooks/useProposals";
import { usePointsTransactions } from "@/lib/hooks/useArticles";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount } from "@reown/appkit/react";
import { Gavel } from "lucide-react";
import type { Proposal } from "@/lib/api/supabaseApi";

function ProposalCardWithVote({
  proposal,
  userId,
  onVote,
  canVote,
  isLoadingVote,
}: {
  proposal: Proposal & { status: "pending" | "active" | "passed" | "rejected" };
  userId: string | null;
  onVote: (proposalId: string, voteOption: "yes" | "no" | "abstain") => void;
  canVote: boolean;
  isLoadingVote: boolean;
}) {
  const { data: userVote } = useUserVote(proposal.proposal_id, userId);
  return (
    <ProposalCard
      proposal={{
        ...proposal,
        status: proposal.status as "pending" | "active" | "passed" | "rejected",
      }}
      onVote={onVote}
      userVote={(userVote?.option as "yes" | "no" | "abstain" | null) || null}
      canVote={canVote}
      isLoadingVote={isLoadingVote}
    />
  );
}

export default function GovernancePage() {
  const { user } = useUser();
  const { isConnected } = useAppKitAccount();

  const { data: proposals, isLoading, error } = useProposals();
  const { data: transactions = [] } = usePointsTransactions(user?.id || null);
  const voteMutation = useVote();

  const calculateVotingPower = (): number => {
    if (!transactions || transactions.length === 0) return 1;

    const balance = transactions.reduce((total, tx) => {
      return tx.transaction_type === "earn"
        ? total + tx.points_amount
        : total - tx.points_amount;
    }, 0);

    return Math.max(1, Math.floor(balance / 100));
  };

  const handleVote = async (
    proposalId: string,
    voteOption: "yes" | "no" | "abstain"
  ) => {
    if (!user?.id || !isConnected) {
      alert("Please connect your wallet and sign in to vote");
      return;
    }

    const votingPower = calculateVotingPower();

    await voteMutation.mutateAsync({
      proposalId,
      voteOption,
      votingPower,
    });
  };

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Governance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Participate in community governance and vote on proposals
          </p>
        </div>

        {isLoading ? (
          <LoadingState message="Loading proposals..." />
        ) : error ? (
          <EmptyState
            title="Failed to load proposals"
            message="Please try refreshing the page"
            icon={<Gavel className="w-12 h-12 text-gray-400" />}
          />
        ) : !proposals || proposals.length === 0 ? (
          <EmptyState
            title="No proposals yet"
            message="Check back later for new governance proposals"
            icon={<Gavel className="w-12 h-12 text-gray-400" />}
          />
        ) : (
          <div className="space-y-6">
            {proposals?.map((proposal) => (
              <ProposalCardWithVote
                key={proposal.proposal_id}
                proposal={{
                  ...proposal,
                  status: proposal.status as "pending" | "active" | "passed" | "rejected",
                }}
                userId={user?.id || null}
                onVote={handleVote}
                canVote={!!user && isConnected && proposal.status === "active"}
                isLoadingVote={voteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

