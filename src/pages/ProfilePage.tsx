"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKitAccount } from "@reown/appkit/react";
import { User, Wallet, Bookmark, Heart, MessageCircle, Crown, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PointsConversion } from "@/components/points/PointsConversion";
import { AdSlotSubscriptions } from "@/components/adslot/AdSlotSubscriptions";
import { Link } from "react-router-dom";

/**
 * ProfilePage Component
 * Responsive profile page for both web and mobile views
 * Displays user data from Clerk publicMetadata
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <EmptyState
            title="Sign in required"
            message="Please sign in via Reown to view your profile"
            icon={<User className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  const points = (user.publicMetadata?.points as number) || 0;
  const subscriptionTier = (user.publicMetadata?.subscription_tier as string) || "free";
  const subscriptionExpiry = user.publicMetadata?.subscription_expiry as string | null;
  const referralCode = (user.publicMetadata?.referral_code as string) || "N/A";
  const totalSubmissions = (user.publicMetadata?.total_submissions as number) || 0;
  const totalUpvotes = (user.publicMetadata?.total_upvotes as number) || 0;
  const loginStreak = (user.publicMetadata?.login_streak as number) || 0;
  const reownAddress = (user.publicMetadata?.reown_address as string) || address || "Not connected";
  const smartAccountAddress = (user.publicMetadata?.smart_account_address as string) || address || "Not connected";
  
  const isSubscriptionActive = subscriptionExpiry
    ? new Date(subscriptionExpiry) > new Date()
    : false;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs sm:text-sm font-semibold">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
            Premium
          </span>
        );
      case "pro":
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs sm:text-sm font-semibold">
            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
            Pro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs sm:text-sm font-semibold">
            Free
          </span>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Header - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
              {user.primaryEmailAddress?.emailAddress?.[0].toUpperCase() || "U"}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {user.primaryEmailAddress?.emailAddress ||
                    user.username ||
                    "User"}
                </h1>
                {getTierBadge(subscriptionTier)}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                Member since{" "}
                {user.createdAt
                  ? formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })
                  : "recently"}
              </p>
              {isConnected && reownAddress && (
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <Wallet size={14} className="sm:w-4 sm:h-4" />
                  <span className="font-mono truncate">
                    {reownAddress.substring(0, 6)}...
                    {reownAddress.substring(reownAddress.length - 4)}
                  </span>
                </div>
              )}
              {smartAccountAddress && smartAccountAddress !== reownAddress && (
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Wallet size={12} />
                  <span className="font-mono text-xs truncate">
                    Smart Account: {smartAccountAddress.substring(0, 6)}...
                    {smartAccountAddress.substring(smartAccountAddress.length - 4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Points
              </h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {points.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
              From Clerk metadata
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Submissions
              </h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {totalSubmissions}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upvotes
              </h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {totalUpvotes}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Streak
              </h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {loginStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              days
            </p>
          </div>
        </div>

        {/* Account Information - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Referral Code</p>
              <p className="text-base sm:text-lg font-mono font-semibold text-gray-900 dark:text-gray-100 break-all">
                {referralCode}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Subscription Tier</p>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                {getTierBadge(subscriptionTier)}
                {subscriptionExpiry && isSubscriptionActive && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Expires {new Date(subscriptionExpiry).toLocaleDateString()}
                  </span>
                )}
              </div>
              {subscriptionTier === "free" && (
                <Link
                  to="/subscription"
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 mt-1 inline-block"
                >
                  Upgrade →
                </Link>
              )}
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Reown Address</p>
              <p className="text-xs sm:text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                {reownAddress}
              </p>
            </div>
            {smartAccountAddress && smartAccountAddress !== reownAddress && (
              <div className="sm:col-span-2">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Smart Account</p>
                <p className="text-xs sm:text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {smartAccountAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Points Conversion */}
        <div className="mb-4 sm:mb-6">
          <PointsConversion />
        </div>

        {/* Ad Slot Subscriptions */}
        <div className="mb-4 sm:mb-6">
          <AdSlotSubscriptions />
        </div>
      </div>
    </ErrorBoundary>
  );
}
