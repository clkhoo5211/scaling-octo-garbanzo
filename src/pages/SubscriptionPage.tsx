import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { Crown, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { SubscriptionPurchase } from "@/components/subscription/SubscriptionPurchase";
import { useState, useEffect } from "react";
import { PricingTable } from "@clerk/clerk-react";
import { CLERK_BILLING_ENABLED } from "@/lib/config/clerkBilling";

export default function SubscriptionPage() {
  const { user, isLoaded } = useUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [useClerkBilling, setUseClerkBilling] = useState(CLERK_BILLING_ENABLED);

  // Check if Clerk Billing is enabled
  useEffect(() => {
    // Use environment variable or config file setting
    setUseClerkBilling(CLERK_BILLING_ENABLED);
  }, []);

  if (!isLoaded) {
    return <LoadingState message="Loading subscription..." fullScreen />;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Sign in required"
            message="Please sign in via Reown to view your subscription"
            icon={<Crown className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Use Clerk's PricingTable if billing is enabled, otherwise use custom implementation
  if (useClerkBilling) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Subscription & Billing
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a plan that works for you
            </p>
          </div>
          <PricingTable />
        </div>
      </ErrorBoundary>
    );
  }

  const subscriptionTier = (user.publicMetadata?.subscription_tier as string) || "free";
  const subscriptionExpiry = user.publicMetadata?.subscription_expiry as string | null;
  const points = (user.publicMetadata?.points as number) || 0;

  const isPro = subscriptionTier === "pro";
  const isPremium = subscriptionTier === "premium";
  const isFree = subscriptionTier === "free";

  const isActive = subscriptionExpiry
    ? new Date(subscriptionExpiry) > new Date()
    : false;

  const features = {
    free: {
      name: "Free",
      price: "$0/month",
      features: [
        "Read unlimited articles",
        "Bookmark up to 50 articles",
        "Basic recommendations",
        "5 direct messages per day",
        "Vote on governance (1x power)",
      ],
      badge: null,
    },
    pro: {
      name: "Pro",
      price: "30 USDT/month",
      features: [
        "All Free features",
        "Unlimited bookmarks",
        "AI-powered personalized feed",
        "Unlimited direct messages",
        "Ad-free experience",
        "⭐ Pro badge on profile",
        "Enhanced governance voting (5x power)",
        "Early access to new features",
      ],
      badge: <Star className="w-5 h-5 text-blue-500" />,
    },
    premium: {
      name: "Premium",
      price: "100 USDT/month",
      features: [
        "All Pro features",
        "Priority content moderation review",
        "Custom content sources (request any API)",
        "Advanced analytics dashboard",
        "💎 Premium badge on profile",
        "2x points earning rate",
        "VIP support (24-hour response)",
        "Maximum governance voting power (10x)",
      ],
      badge: <Crown className="w-5 h-5 text-purple-500" />,
    },
  };

  const currentTier = features[subscriptionTier as keyof typeof features] || features.free;

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Subscription & Billing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription tier and billing information
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Current Plan
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentTier.badge}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {currentTier.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentTier.price}
                </p>
              </div>
            </div>
            <div className="text-right">
              {isActive && subscriptionExpiry ? (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expires on
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(subscriptionExpiry).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    Active
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Your Features
          </h2>
          <ul className="space-y-2">
            {currentTier.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {isFree && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Upgrade Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Pro
                  </h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  30 USDT/month
                </p>
                <ul className="space-y-2 mb-6">
                  {features.pro.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <SubscriptionPurchase
                  tier="pro"
                  onSuccess={() => {
                    setRefreshKey((k) => k + 1);
                    window.location.reload();
                  }}
                />
              </div>

              <div className="border-2 border-purple-500 rounded-lg p-6 relative">
                <div className="absolute top-4 right-4 bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  BEST VALUE
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Premium
                  </h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  100 USDT/month
                </p>
                <ul className="space-y-2 mb-6">
                  {features.premium.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <SubscriptionPurchase
                  tier="premium"
                  onSuccess={() => {
                    setRefreshKey((k) => k + 1);
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Subscription Tier</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {subscriptionTier}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Points Balance</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {points.toLocaleString()} points
              </p>
            </div>
            {subscriptionExpiry && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(subscriptionExpiry).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500 dark:text-gray-400">Data Source</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                Clerk publicMetadata
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

