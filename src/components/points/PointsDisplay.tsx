'use client';

import { Coins, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { usePointsTransactions } from '@/lib/hooks/useArticles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/services/supabase';

interface PointsDisplayProps {
  points?: number;
  usdtValue?: number;
  showConversion?: boolean;
}

/**
 * PointsDisplay Component
 * Displays user points with optional USDT conversion
 */
export function PointsDisplay({
  points: propPoints,
  usdtValue: propUsdtValue,
  showConversion = false,
}: PointsDisplayProps) {
  const { user } = useUser();
  const { data: transactions = [] } = usePointsTransactions(user?.id || null);

  const { data: points } = useQuery({
    queryKey: ['user-points', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase
        .from('points_transactions')
        .select('points_amount, transaction_type')
        .eq('user_id', user.id);

      if (error) throw error;
      return (
        data?.reduce((total, tx) => {
          return tx.transaction_type === 'earn'
            ? total + tx.points_amount
            : total - tx.points_amount;
        }, 0) || 0
      );
    },
    enabled: !!user?.id,
    initialData: propPoints,
  });

  const conversionRate = 1000; // 1000 points = 1 USDT
  const usdtValue = propUsdtValue !== undefined 
    ? propUsdtValue 
    : points ? points / conversionRate : 0;

  const displayPoints = propPoints !== undefined ? propPoints : (points || 0);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Points & Rewards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your points balance and transaction history
        </p>
      </div>

      {/* Points Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-8 h-8 text-yellow-500" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {displayPoints.toLocaleString()}
              </span>
              <span className="text-lg text-gray-500 dark:text-gray-400">points</span>
            </div>
            {showConversion && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ≈ {usdtValue.toFixed(2)} USDT
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Transaction History
        </h2>
        <TransactionHistory
          transactions={transactions.map((tx) => ({
            id: tx.id,
            type: tx.transaction_type as 'earn' | 'spend' | 'convert',
            points: tx.points_amount,
            usdt: tx.usdt_amount || undefined,
            source: tx.source || undefined,
            createdAt: tx.created_at,
          }))}
        />
      </div>
    </div>
  );
}

interface TransactionHistoryProps {
  transactions: Array<{
    id: string;
    type: 'earn' | 'spend' | 'convert';
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
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isEarn = tx.type === 'earn';
        const isConvert = tx.type === 'convert';

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {isEarn ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : isConvert ? (
                <Coins className="w-5 h-5 text-blue-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <div>
                <div className="font-medium text-sm">
                  {isEarn && `Earned ${tx.points} points`}
                  {isConvert && `Converted ${tx.points} points to ${tx.usdt} USDT`}
                  {!isEarn && !isConvert && `Spent ${tx.points} points`}
                </div>
                {tx.source && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tx.source}
                  </div>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
            <div
              className={`text-sm font-medium ${
                isEarn ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isEarn ? '+' : '-'}
              {tx.points}
            </div>
          </div>
        );
      })}
    </div>
  );
}

