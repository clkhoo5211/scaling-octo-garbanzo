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
import { UserProfile } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { StatsSection } from "@/components/profile/StatsSection";
import { CLERK_BILLING_ENABLED } from "@/lib/config/clerkBilling";

/**
 * ProfilePage Component
 * Responsive profile page for both web and mobile views
 * Uses Clerk's UserProfile component with billing tab if billing is enabled
 * Falls back to custom implementation with Clerk publicMetadata
 */
export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { address, isConnected } = useAppKitAccount();
  const [useClerkBilling, setUseClerkBilling] = useState(CLERK_BILLING_ENABLED);

  // Check if Clerk Billing is enabled
  useEffect(() => {
    // Use environment variable or config file setting
    setUseClerkBilling(CLERK_BILLING_ENABLED);
  }, []);

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

  // Use Clerk's UserProfile component if billing is enabled
  // This includes billing management tab automatically
  if (useClerkBilling) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Custom Stats Section (keep your custom stats) */}
          <div className="mb-6">
            <StatsSection user={user} address={address} isConnected={isConnected} />
          </div>
          
          {/* Clerk's UserProfile Component (includes billing tab) */}
          <UserProfile />
        </ErrorBoundary>
      </ErrorBoundary>
    );
  }

  // Custom implementation (fallback when Clerk Billing is not enabled)
  const subscriptionTier = (user.publicMetadata?.subscription_tier as string) || "free";
  const subscriptionExpiry = user.publicMetadata?.subscription_expiry as string | null;
  const referralCode = (user.publicMetadata?.referral_code as string) || "N/A";
  
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
        {/* Stats Section (reusable component) */}
        <StatsSection user={user} address={address} isConnected={isConnected} />

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
