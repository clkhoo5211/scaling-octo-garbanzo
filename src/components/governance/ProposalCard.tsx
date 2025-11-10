"use client";

import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, Minus } from "lucide-react";

interface Proposal {
  proposal_id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "passed" | "rejected" | "pending";
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  created_at: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onVote?: (proposalId: string, voteOption: "yes" | "no" | "abstain") => void;
  userVote?: "yes" | "no" | "abstain" | null;
  canVote?: boolean;
  isLoadingVote?: boolean;
}

/**
 * ProposalCard Component
 * Displays governance proposal with voting options
 */
export function ProposalCard({
  proposal,
  onVote,
  userVote,
  canVote = false,
}: ProposalCardProps) {
  const totalVotes =
    proposal.yes_votes + proposal.no_votes + proposal.abstain_votes;
  const yesPercentage =
    totalVotes > 0 ? (proposal.yes_votes / totalVotes) * 100 : 0;
  const noPercentage =
    totalVotes > 0 ? (proposal.no_votes / totalVotes) * 100 : 0;
  const abstainPercentage =
    totalVotes > 0 ? (proposal.abstain_votes / totalVotes) * 100 : 0;

  const getStatusColor = () => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (proposal.status) {
      case "active":
        return `${base} bg-info/15 text-info`;
      case "passed":
        return `${base} bg-success/15 text-success`;
      case "rejected":
        return `${base} bg-danger/15 text-danger`;
      default:
        return `${base} bg-surface-subtle text-text-secondary`;
    }
  };

  return (
    <div className="rounded-card border border-border-subtle bg-background-elevated p-6 shadow-card">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            {proposal.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-text-tertiary">
            <span className={getStatusColor()}>{proposal.status}</span>
            <span>{proposal.category}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(proposal.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mb-5 line-clamp-3 text-sm text-text-secondary">
        {proposal.description}
      </p>

      {/* Vote Results */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>Yes</span>
          </div>
          <div className="flex items-center gap-2 text-text-tertiary">
            <span className="font-medium text-text-primary">
              {proposal.yes_votes}
            </span>
            <span>({yesPercentage.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-border-subtle">
          <div
            className="h-2 rounded-full bg-success transition-all"
            style={{ width: `${yesPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-danger" />
            <span>No</span>
          </div>
          <div className="flex items-center gap-2 text-text-tertiary">
            <span className="font-medium text-text-primary">
              {proposal.no_votes}
            </span>
            <span>({noPercentage.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-border-subtle">
          <div
            className="h-2 rounded-full bg-danger transition-all"
            style={{ width: `${noPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-text-tertiary" />
            <span>Abstain</span>
          </div>
          <div className="flex items-center gap-2 text-text-tertiary">
            <span className="font-medium text-text-primary">
              {proposal.abstain_votes}
            </span>
            <span>({abstainPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Voting Buttons */}
      {canVote && proposal.status === "active" && (
        <div className="flex gap-2 border-t border-border-subtle pt-4">
          <button
            onClick={() => onVote?.(proposal.proposal_id, "yes")}
            disabled={userVote === "yes"}
            className={`flex-1 rounded-button px-4 py-2 text-sm font-medium transition-smooth ${
              userVote === "yes"
                ? "bg-success text-white shadow-card"
                : "bg-success/10 text-success hover:bg-success/15"
            }`}
          >
            Vote Yes
          </button>
          <button
            onClick={() => onVote?.(proposal.proposal_id, "no")}
            disabled={userVote === "no"}
            className={`flex-1 rounded-button px-4 py-2 text-sm font-medium transition-smooth ${
              userVote === "no"
                ? "bg-danger text-white shadow-card"
                : "bg-danger/10 text-danger hover:bg-danger/15"
            }`}
          >
            Vote No
          </button>
          <button
            onClick={() => onVote?.(proposal.proposal_id, "abstain")}
            disabled={userVote === "abstain"}
            className={`flex-1 rounded-button px-4 py-2 text-sm font-medium transition-smooth ${
              userVote === "abstain"
                ? "bg-text-tertiary text-white shadow-card"
                : "bg-surface-subtle text-text-secondary hover:bg-surface-strong/50"
            }`}
          >
            Abstain
          </button>
        </div>
      )}

      {/* User Vote Indicator */}
      {userVote && (
        <div className="mt-3 text-sm text-text-tertiary">
          You voted: <span className="font-medium capitalize">{userVote}</span>
        </div>
      )}
    </div>
  );
}
