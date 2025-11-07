"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppKit } from "@reown/appkit/react";
import { User, Wallet, Bookmark, Heart, MessageCircle } from "lucide-react";
import { useBookmarks } from "@/lib/hooks/useArticles";
import { usePointsTransactions } from "@/lib/hooks/useArticles";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { address, isConnected } = useAppKit();

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks(
    user?.id || null
  );
  const { data: transactions = [], isLoading: transactionsLoading } =
    usePointsTransactions(user?.id || null);

  if (!isLoaded) {
    return <LoadingState message="Loading profile..." fullScreen />;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Sign in required"
            message="Please sign in to view your profile"
            icon={<User className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  const totalPoints = transactions.reduce((sum, tx) => {
    return tx.transaction_type === "earn"
      ? sum + tx.points_amount
      : sum - tx.points_amount;
  }, 0);

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {user.primaryEmailAddress?.emailAddress ||
                  user.username ||
                  "User"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Member since{" "}
                {formatDistanceToNow(new Date(user.createdAt!), {
                  addSuffix: true,
                })}
              </p>
              {isConnected && address && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Wallet size={16} />
                  <span className="font-mono">
                    {address.substring(0, 6)}...
                    {address.substring(address.length - 4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Bookmarks
              </h3>
            </div>
            {bookmarksLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {bookmarks.length}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Points
              </h3>
            </div>
            {transactionsLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {totalPoints.toLocaleString()}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Messages
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              -
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coming soon
            </p>
          </div>
        </div>

        {/* Recent Bookmarks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Bookmarks
          </h2>
          {bookmarksLoading ? (
            <LoadingState message="Loading bookmarks..." />
          ) : bookmarks.length === 0 ? (
            <EmptyState
              title="No bookmarks yet"
              message="Start bookmarking articles to see them here"
              icon={<Bookmark className="w-12 h-12 text-gray-400" />}
            />
          ) : (
            <ul className="space-y-3">
              {bookmarks.slice(0, 10).map((bookmark) => (
                <li
                  key={bookmark.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <a
                    href={`/article?url=${encodeURIComponent(bookmark.article_id)}`}
                    className="block"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {bookmark.article_title || bookmark.article_id}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      {bookmark.article_source && (
                        <>
                          <span>{bookmark.article_source}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(bookmark.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
