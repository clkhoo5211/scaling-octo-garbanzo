"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount } from "@reown/appkit/react";
import { User, Wallet, Bookmark, Heart, MessageCircle, Crown, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * ProfilePage Component
 * Displays user profile data from Clerk publicMetadata
 * Per requirements: All user data stored in Clerk metadata (not Supabase)
 */
export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { address, isConnected } = useAppKitAccount();

  if (!isLoaded) {
    return <LoadingState message="Loading profile..." fullScreen />;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Sign in required"
            message="Please sign in via Reown to view your profile"
            icon={<User className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Read all data from Clerk publicMetadata (per requirements)
  const points = (user.publicMetadata?.points as number) || 0;
  const subscriptionTier = (user.publicMetadata?.subscription_tier as string) || "free";
  const referralCode = (user.publicMetadata?.referral_code as string) || "N/A";
  const totalSubmissions = (user.publicMetadata?.total_submissions as number) || 0;
  const totalUpvotes = (user.publicMetadata?.total_upvotes as number) || 0;
  const loginStreak = (user.publicMetadata?.login_streak as number) || 0;
  const reownAddress = (user.publicMetadata?.reown_address as string) || address || "Not connected";
  const smartAccountAddress = (user.publicMetadata?.smart_account_address as string) || address || "Not connected";

  // Subscription tier display
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
            <Crown className="w-4 h-4" />
            Premium
          </span>
        );
      case "pro":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
            <Star className="w-4 h-4" />
            Pro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-semibold">
            Free
          </span>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.primaryEmailAddress?.emailAddress?.[0].toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.primaryEmailAddress?.emailAddress ||
                    user.username ||
                    "User"}
                </h1>
                {getTierBadge(subscriptionTier)}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Member since{" "}
                {user.createdAt
                  ? formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })
                  : "recently"}
              </p>
              {isConnected && reownAddress && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Wallet size={16} />
                  <span className="font-mono">
                    {reownAddress.substring(0, 6)}...
                    {reownAddress.substring(reownAddress.length - 4)}
                  </span>
                </div>
              )}
              {smartAccountAddress && smartAccountAddress !== reownAddress && (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Wallet size={16} />
                  <span className="font-mono text-xs">
                    Smart Account: {smartAccountAddress.substring(0, 6)}...
                    {smartAccountAddress.substring(smartAccountAddress.length - 4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Points
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {points.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              From Clerk metadata
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Submissions
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {totalSubmissions}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upvotes
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {totalUpvotes}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Streak
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {loginStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              days
            </p>
          </div>
        </div>

        {/* User Metadata Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Referral Code</p>
              <p className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
                {referralCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subscription Tier</p>
              <div className="mt-1">{getTierBadge(subscriptionTier)}</div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reown Address</p>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                {reownAddress}
              </p>
            </div>
            {smartAccountAddress && smartAccountAddress !== reownAddress && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Smart Account</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {smartAccountAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
