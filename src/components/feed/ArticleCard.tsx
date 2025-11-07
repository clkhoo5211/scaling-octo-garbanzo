"use client";

import Link from "next/link";
import { memo, useState } from "react";
import type { Article } from "@/lib/services/indexedDBCache";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { useAppStore } from "@/lib/stores/appStore";
import {
  useLikeArticle,
  useUnlikeArticle,
  useArticleLikes,
} from "@/lib/hooks/useArticles";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArticlePreviewModal } from "@/components/article/ArticlePreviewModal";

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
  const { isLiked, isBookmarked, addBookmark, removeBookmark } = useAppStore();
  const likeMutation = useLikeArticle();
  const unlikeMutation = useUnlikeArticle();
  const { data: likesCount = 0 } = useArticleLikes(article.id);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const liked = isLiked(article.id);
  const bookmarked = isBookmarked(article.id);

  const handleLike = () => {
    if (liked) {
      unlikeMutation.mutate(article.id);
    } else {
      likeMutation.mutate(article.id);
    }
    onUpvote?.(article.id);
  };

  const handleBookmark = () => {
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
    if (onSelect) {
      e.preventDefault();
      onSelect(article);
      return;
    }

    // Handle preview mode
    if (previewMode === "modal" || previewMode === "both") {
      e.preventDefault();
      setShowPreviewModal(true);
    }
    // If previewMode is "fullpage", let the Link handle navigation
  };

  return (
    <>
      <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <Link
          href={`/article?url=${encodeURIComponent(article.url)}`}
          onClick={handleCardClick}
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
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {truncate(article.excerpt, 150)}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike();
                  }}
                  className={liked ? "text-red-500" : "text-gray-400"}
                  aria-label="Like article"
                >
                  <span className="text-sm font-medium">👍 {likesCount}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleBookmark();
                  }}
                  className={bookmarked ? "text-yellow-500" : "text-gray-400"}
                  aria-label="Bookmark article"
                >
                  🔖
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleShare();
                  }}
                  className="text-gray-400"
                  aria-label="Share article"
                >
                  📤
                </button>
              </div>
              {article.comments !== undefined && (
                <span className="text-sm text-gray-500">
                  {article.comments} comments
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>

      {/* Article Preview Modal */}
      {previewMode === "modal" || previewMode === "both" ? (
        <ArticlePreviewModal
          articleUrl={article.url}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onOpenFullPage={() => {
            window.location.href = `/article?url=${encodeURIComponent(article.url)}`;
          }}
        />
      ) : null}
    </>
  );
});

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton height={20} className="mb-2" />
      <Skeleton height={16} width="60%" className="mb-4" />
      <Skeleton height={16} width="40%" />
    </div>
  );
}
