"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Minus, Loader2 } from "lucide-react";
import { TransactionStatus } from "@/components/web3/TransactionStatus";

interface VoteButtonProps {
  proposalId: string;
  voteOption: "yes" | "no" | "abstain";
  disabled?: boolean;
  contractAddress?: string;
  abi?: unknown[];
  onVote?: (
    proposalId: string,
    voteOption: "yes" | "no" | "abstain"
  ) => Promise<void>;
}

/**
 * VoteButton Component
 * Button for voting on governance proposals
 */
export function VoteButton({
  proposalId,
  voteOption,
  disabled = false,
  onVote,
}: VoteButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  const handleVote = async () => {
    setIsSubmitting(true);
    setTxHash(undefined);

    try {
      if (onVote) {
        await onVote(proposalId, voteOption);
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      console.error("Vote failed:", error);
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (voteOption) {
      case "yes":
        return <CheckCircle className="w-4 h-4" />;
      case "no":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (voteOption) {
      case "yes":
        return "Vote Yes";
      case "no":
        return "Vote No";
      default:
        return "Abstain";
    }
  };

  const getColor = () => {
    switch (voteOption) {
      case "yes":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "no":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  const isLoading = isSubmitting;

  return (
    <>
      {txHash && (
        <TransactionStatus
          hash={txHash}
          onSuccess={() => setIsSubmitting(false)}
          onError={() => setIsSubmitting(false)}
        />
      )}
      <button
        onClick={handleVote}
        disabled={disabled || isLoading}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getColor()}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {getIcon()}
            <span>{getLabel()}</span>
          </>
        )}
      </button>
    </>
  );
}
