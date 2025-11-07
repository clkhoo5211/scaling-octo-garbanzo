"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/services/indexedDBCache";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { useAppStore } from "@/lib/stores/appStore";
import {
  useLikeArticle,
  useUnlikeArticle,
  useArticleLikes,
} from "@/lib/hooks/useArticles";
import { useClerkUser } from "@/lib/hooks/useClerkUser";
import { useAppKit } from "@reown/appkit/react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArticlePreviewModal } from "@/components/article/ArticlePreviewModal";
import { Modal } from "@/components/ui/Modal";

export interface ArticleCardProps {
  article: Article;
  variant?: "compact" | "expanded" | "featured";
  onUpvote?: (articleId: string) => void;
  onBookmark?: (articleId: string) => void;
  onShare?: (articleId: string) => void;
  onSelect?: (article: Article) => void;
  previewMode?: "modal" | "fullpage" | "both"; // New prop for preview mode
}

export const ArticleCard = memo(function ArticleCard({
  article,
  variant = "compact",
  onUpvote,
  onBookmark,
  onShare,
  onSelect,
  previewMode = "both", // Default to both modal and fullpage
}: ArticleCardProps) {
  const router = useRouter();
  const { user, isLoaded: authLoaded, isSignedIn } = useClerkUser();
  const { open } = useAppKit();
  const { isLiked, isBookmarked, addBookmark, removeBookmark } = useAppStore();
  const likeMutation = useLikeArticle();
  const unlikeMutation = useUnlikeArticle();
  const { data: likes } = useArticleLikes(article.id);
  const likesCount = likes?.length || 0;
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const liked = isLiked(article.id);
  const bookmarked = isBookmarked(article.id);

  const handleLike = () => {
    // Require login for liking
    if (!authLoaded) return;
    if (!isSignedIn) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (liked) {
      unlikeMutation.mutate(article.id);
    } else {
      likeMutation.mutate(article.id);
    }
    onUpvote?.(article.id);
  };

  const handleBookmark = () => {
    // Require login for bookmarking
    if (!authLoaded) return;
    if (!isSignedIn) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (bookmarked) {
      removeBookmark(article.id);
    } else {
      addBookmark(article.id);
    }
    onBookmark?.(article.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.excerpt,
        url: article.url,
      });
    }
    onShare?.(article.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Allow guests to browse articles freely - no login required for viewing
    // Handle preview mode first - modal takes precedence
    if (previewMode === "modal" || previewMode === "both") {
      setShowPreviewModal(true);
      // Call onSelect if provided (for tracking/analytics) but don't navigate
      onSelect?.(article);
      return;
    }

    // If previewMode is "fullpage", navigate to full page
    if (previewMode === "fullpage") {
      if (onSelect) {
        onSelect(article);
      } else {
        router.push(`/article?url=${encodeURIComponent(article.url)}`);
      }
      return;
    }
  };

  const handleLogin = () => {
    setShowLoginPrompt(false);
    // Open Reown AppKit modal with social logins (PRIMARY authentication)
    open({ view: "Connect" });
  };

  return (
    <>
      <article className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden hover:shadow-elevated hover:border-primary/50 transition-all duration-200 group">
        <div
          onClick={handleCardClick}
          className="cursor-pointer"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start gap-3 mb-2">
              {article.thumbnail && variant !== "compact" && (
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(article.publishedAt)}</span>
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>{article.author}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Excerpt */}
            {article.excerpt && variant !== "compact" && (
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                {truncate(article.excerpt, 150)}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike();
                  }}
                  className={`transition-colors hover:scale-110 ${liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
                  aria-label="Like article"
                >
                  <span className="text-sm font-medium">👍 {likesCount || 0}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleBookmark();
                  }}
                  className={`transition-colors hover:scale-110 ${bookmarked ? "text-yellow-500" : "text-gray-400 hover:text-yellow-400"}`}
                  aria-label="Bookmark article"
                >
                  🔖
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleShare();
                  }}
                  className="text-gray-400 hover:text-primary transition-colors hover:scale-110"
                  aria-label="Share article"
                >
                  📤
                </button>
              </div>
              {article.comments !== undefined && (
                <span className="text-sm text-gray-400">
                  {article.comments} comments
                </span>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Login Prompt Modal */}
      <Modal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Sign In Required"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view articles and access all features.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </Modal>

      {/* Article Preview Modal */}
      {previewMode === "modal" || previewMode === "both" ? (
        <ArticlePreviewModal
          articleUrl={article.url}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onOpenFullPage={() => {
            router.push(`/article?url=${encodeURIComponent(article.url)}`);
          }}
        />
      ) : null}
    </>
  );
});

export function ArticleCardSkeleton() {
  return (
    <div className="bg-gray-700 rounded-lg border border-gray-600 p-4 animate-pulse">
      <Skeleton height={20} className="mb-2" />
      <Skeleton height={16} width="60%" className="mb-4" />
      <Skeleton height={16} width="40%" />
    </div>
  );
}
