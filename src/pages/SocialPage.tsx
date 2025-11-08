import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useFollowing, useArticles } from "@/lib/hooks/useArticles";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useAppStore } from "@/lib/stores/appStore";
import { Users } from "lucide-react";

export default function SocialPage() {
  const { isLoaded } = useUser();
  const { userId } = useAppStore();
  const { data: following, isLoading: isLoadingFollowing } =
    useFollowing(userId);

  const { data: followingArticles, isLoading: isLoadingFeed } = useArticles(
    "social",
    {
      usePagination: true,
    }
  );

  const followingIds = following || [];
  const isLoading = isLoadingFollowing || isLoadingFeed;

  if (!isLoaded) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 dark:text-gray-100">Social</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
              Following Feed
            </h2>
            {isLoadingFeed ? (
              <LoadingState message="Loading feed..." />
            ) : !followingArticles || followingArticles.length === 0 ? (
              <EmptyState
                title="No articles yet"
                message={
                  followingIds.length === 0
                    ? "Follow users to see their articles here"
                    : "No articles from users you follow"
                }
                icon={<Users className="w-12 h-12 text-gray-400" />}
              />
            ) : (
              <div className="space-y-4">
                {followingArticles.slice(0, 5).map((article) => (
                  <div
                    key={article.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {article.source} •{" "}
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {followingArticles.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{followingArticles.length - 5} more articles
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
              Discover Users
            </h2>
            {isLoading ? (
              <LoadingState message="Loading users..." />
            ) : (
              <EmptyState
                title="User discovery coming soon"
                message="We're working on adding user discovery features"
                icon={<Users className="w-12 h-12 text-gray-400" />}
              />
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

