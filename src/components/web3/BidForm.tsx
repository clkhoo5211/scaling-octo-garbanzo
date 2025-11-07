"use client";

import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitBalance } from "@reown/appkit/react";
import { Loader2, AlertCircle } from "lucide-react";
import { TransactionStatus } from "./TransactionStatus";

interface BidFormProps {
  auctionId: string;
  currentBid: string;
  minBid: string;
  onBid: (amount: string, tenure: string) => Promise<void>;
  contractAddress?: string;
  abi?: any[];
}

/**
 * BidForm Component
 * Form for placing bids on ad auctions
 */
export function BidForm({
  auctionId,
  minBid,
  onBid,
  contractAddress,
  abi,
}: BidFormProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [tenure, setTenure] = useState("1week");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();

  const { address } = useAppKitAccount();
  const { fetchBalance } = useAppKitBalance();
  const [balance, setBalance] = useState<{ formatted: string } | null>(null);
  
  // Fetch balance on mount
  useEffect(() => {
    if (address) {
      fetchBalance().then((result) => {
        if (result.isSuccess && result.data) {
          setBalance({ formatted: result.data.formatted || "0" });
        }
      });
    }
  }, [address, fetchBalance]);
  
  // Remove useWriteContract for now - not available in AppKit
  const [isPending, setIsPending] = useState(false);
  const [hash, setHash] = useState<string | undefined>();

  const validateBid = (amount: string): string | null => {
    const amountNum = parseFloat(amount);
    const minBidNum = parseFloat(minBid);

    if (isNaN(amountNum) || amountNum <= 0) {
      return "Bid amount must be greater than 0";
    }

    if (amountNum < minBidNum) {
      return `Bid must be at least ${minBidNum} USDT (5% higher than current bid)`;
    }

    if (balance && amountNum > parseFloat(balance.formatted)) {
      return "Insufficient USDT balance";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(undefined);

    const validationError = validateBid(bidAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, use callback only - contract interaction needs wagmi setup
      await onBid(bidAmount, tenure);
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Failed to place bid");
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Transaction Status */}
      {txHash && (
        <TransactionStatus
          hash={txHash}
          onSuccess={() => {
            setIsSubmitting(false);
            setBidAmount("");
          }}
          onError={() => setIsSubmitting(false)}
        />
      )}

      {/* Error Message */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200"
          role="alert"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Bid Amount */}
      <div>
        <label htmlFor="bid-amount" className="block text-sm font-medium mb-2">
          Bid Amount (USDT)
        </label>
        <input
          id="bid-amount"
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          min={minBid}
          step="0.01"
          required
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-describedby={error ? "bid-error" : undefined}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Minimum bid: {minBid} USDT
          {balance && (
            <span className="ml-2">
              • Balance: {parseFloat(balance.formatted).toFixed(2)} USDT
            </span>
          )}
        </p>
      </div>

      {/* Tenure */}
      <div>
        <label htmlFor="tenure" className="block text-sm font-medium mb-2">
          Ad Duration
        </label>
        <select
          id="tenure"
          value={tenure}
          onChange={(e) => setTenure(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="1week">1 Week</option>
          <option value="2weeks">2 Weeks</option>
          <option value="1month">1 Month</option>
          <option value="3months">3 Months</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !address}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Place Bid</span>
        )}
      </button>

      {!address && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Please connect your wallet to place a bid
        </p>
      )}
    </form>
  );
}
