'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Minus, Clock, Users } from 'lucide-react';

interface Proposal {
  proposal_id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  created_at: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onVote?: (proposalId: string, voteOption: 'yes' | 'no' | 'abstain') => void;
  userVote?: 'yes' | 'no' | 'abstain' | null;
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
  isLoadingVote = false,
}: ProposalCardProps) {
  const totalVotes = proposal.yes_votes + proposal.no_votes + proposal.abstain_votes;
  const yesPercentage = totalVotes > 0 ? (proposal.yes_votes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (proposal.no_votes / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal.abstain_votes / totalVotes) * 100 : 0;

  const getStatusColor = () => {
    switch (proposal.status) {
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'passed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {proposal.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {proposal.status}
            </span>
            <span>{proposal.category}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {proposal.description}
      </p>

      {/* Vote Results */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Yes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{proposal.yes_votes}</span>
            <span className="text-gray-500">({yesPercentage.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${yesPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>No</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{proposal.no_votes}</span>
            <span className="text-gray-500">({noPercentage.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all"
            style={{ width: `${noPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-gray-500" />
            <span>Abstain</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{proposal.abstain_votes}</span>
            <span className="text-gray-500">({abstainPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Voting Buttons */}
      {canVote && proposal.status === 'active' && (
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onVote?.(proposal.proposal_id, 'yes')}
            disabled={userVote === 'yes'}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              userVote === 'yes'
                ? 'bg-green-500 text-white'
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
            }`}
          >
            Vote Yes
          </button>
          <button
            onClick={() => onVote?.(proposal.proposal_id, 'no')}
            disabled={userVote === 'no'}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              userVote === 'no'
                ? 'bg-red-500 text-white'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
            }`}
          >
            Vote No
          </button>
          <button
            onClick={() => onVote?.(proposal.proposal_id, 'abstain')}
            disabled={userVote === 'abstain'}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              userVote === 'abstain'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Abstain
          </button>
        </div>
      )}

      {/* User Vote Indicator */}
      {userVote && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          You voted: <span className="font-medium capitalize">{userVote}</span>
        </div>
      )}
    </div>
  );
}

