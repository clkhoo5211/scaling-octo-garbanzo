import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import { useBookmarks } from "@/lib/hooks/useArticles";
import { Bookmark, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function BookmarksPage() {
  const { user, isLoaded } = useUser();
  const { data: bookmarks = [], isLoading } = useBookmarks(user?.id || null);

  if (!isLoaded) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Sign in required"
            message="Please sign in to view your bookmarks"
            icon={<Bookmark className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved articles ({bookmarks.length} total)
          </p>
        </div>

        {isLoading ? (
          <LoadingState message="Loading bookmarks..." />
        ) : bookmarks.length === 0 ? (
          <EmptyState
            title="No bookmarks yet"
            message="Start bookmarking articles to see them here"
            icon={<Bookmark className="w-12 h-12 text-gray-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                to={`/article?url=${encodeURIComponent(bookmark.article_id)}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <Bookmark className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

