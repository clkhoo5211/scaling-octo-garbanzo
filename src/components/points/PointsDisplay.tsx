"use client";

import { Coins, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useQuery } from "@tanstack/react-query";
import { getPointsTransactions } from "@/lib/api/supabaseApi";

interface PointsDisplayProps {
  points?: number;
  usdtValue?: number;
  showConversion?: boolean;
}

/**
 * PointsDisplay Component
 * Displays user points from Clerk publicMetadata
 * Fetches transaction history from Supabase for audit trail
 */
export function PointsDisplay({
  points: propPoints,
  usdtValue: propUsdtValue,
  showConversion = false,
}: PointsDisplayProps) {
  const { user } = useUser();

  // Read points from Clerk publicMetadata (per requirements)
  const pointsFromMetadata = (user?.publicMetadata?.points as number) || 0;
  const displayPoints = propPoints !== undefined ? propPoints : pointsFromMetadata;

  const conversionRate = 1000; // 1000 points = 1 USDT
  const usdtValue =
    propUsdtValue !== undefined
      ? propUsdtValue
      : displayPoints / conversionRate;

  // Fetch transaction history from Supabase
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["points-transactions", user?.id],
    queryFn: async () => {
      if (!user?.id) return { data: [], error: null };
      const result = await getPointsTransactions(user.id);
      return result;
    },
    enabled: !!user?.id,
  });

  const transactions = transactionsData?.data || [];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-text-primary">
          Points & Rewards
        </h1>
        <p className="text-text-secondary">
          Track your points balance from Clerk metadata
        </p>
      </div>

      {/* Points Display */}
      <div className="rounded-card border border-border-subtle bg-background-elevated p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/20 text-warning">
            <Coins className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-text-primary">
                {displayPoints.toLocaleString()}
              </span>
              <span className="text-lg text-text-tertiary">
                points
              </span>
            </div>
            {showConversion && (
              <div className="mt-1 text-sm text-text-tertiary">
                ≈ {usdtValue.toFixed(2)} USDT
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 text-sm text-text-tertiary">
          <p>Points stored in Clerk publicMetadata</p>
          <p className="mt-1 text-xs text-text-tertiary/80">
            Reown Address: {user?.publicMetadata?.reown_address as string || "Not connected"}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-card border border-border-subtle bg-background-elevated p-6 shadow-card">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Recent Transactions
        </h2>
        {isLoadingTransactions ? (
          <div className="flex flex-col items-center gap-3 rounded-card bg-surface-subtle/60 py-10 text-center text-text-tertiary">
            <Clock className="h-10 w-10 animate-pulse text-text-tertiary" />
            <p>Loading transactions...</p>
          </div>
        ) : (
          <TransactionHistory transactions={transactions.map(tx => ({
            id: tx.id,
            type: tx.transaction_type as "earn" | "spend" | "convert",
            points: tx.points_amount,
            usdt: tx.usdt_amount || undefined,
            source: tx.source || undefined,
            createdAt: tx.created_at,
          }))} />
        )}
      </div>
    </div>
  );
}

interface TransactionHistoryProps {
  transactions: Array<{
    id: string;
    type: "earn" | "spend" | "convert";
    points: number;
    usdt?: number;
    source?: string;
    createdAt: string;
  }>;
}

/**
 * TransactionHistory Component
 * Displays points transaction history
 */
export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border-subtle/60 bg-surface-subtle/40 py-10 text-center text-text-tertiary">
        <Coins className="h-10 w-10 opacity-60" />
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isEarn = tx.type === "earn";
        const isConvert = tx.type === "convert";

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between rounded-card border border-border-subtle bg-surface-subtle/60 px-4 py-3 transition-smooth hover:bg-surface-subtle"
          >
            <div className="flex items-center gap-3">
              {isEarn ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : isConvert ? (
                <Coins className="h-5 w-5 text-info" />
              ) : (
                <TrendingDown className="h-5 w-5 text-danger" />
              )}
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {isEarn && `Earned ${tx.points} points`}
                  {isConvert &&
                    `Converted ${tx.points} points to ${tx.usdt} USDT`}
                  {!isEarn && !isConvert && `Spent ${tx.points} points`}
                </div>
                {tx.source && (
                  <div className="text-xs text-text-tertiary">
                    {tx.source}
                  </div>
                )}
                <div className="mt-1 flex items-center gap-1 text-xs text-text-tertiary/80">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(tx.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
            <div
              className={`text-sm font-semibold ${
                isEarn
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {isEarn ? "+" : "-"}
              {tx.points}
            </div>
          </div>
        );
      })}
    </div>
  );
}
